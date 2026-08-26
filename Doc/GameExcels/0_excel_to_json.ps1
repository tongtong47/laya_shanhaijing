$ErrorActionPreference = 'Stop'
$dot = [string][char]0x00B7
$jsonDirectory = 'E:\Yijue\Shanhaijing_laya\assets\resources\Gameinfo'
Add-Type -AssemblyName System.Web.Extensions
$script:JsonSerializer = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$script:JsonSerializer.MaxJsonLength = [int]::MaxValue
$script:JsonSerializer.RecursionLimit = 100

function Release-ComObject($value) {
    if ($null -ne $value -and [Runtime.InteropServices.Marshal]::IsComObject($value)) {
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($value)
    }
}

function From-CellValue($value) {
    if ($null -eq $value) { return '' }
    if ($value -is [string]) {
        if ($value.StartsWith('@str:')) { return $value.Substring(5) }
        # Keep special characters such as '&' exactly as entered in Excel.
        return [string]$value
    }
    if ($value -is [double] -and $value -eq [Math]::Truncate($value) -and [Math]::Abs($value) -le 9007199254740991) {
        return [long]$value
    }
    return $value
}

function Test-SkipRowByFirstCell($value) {
    if ($null -eq $value -or [string]::IsNullOrWhiteSpace([string]$value)) { return $true }
    return ([string]$value -match '[\u3400-\u9FFF]')
}

if ($args.Count -eq 0) { throw 'Drop one or more Excel files onto 0_excel_to_json.bat.' }
[IO.Directory]::CreateDirectory($jsonDirectory) | Out-Null
$excel = $null
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    foreach ($inputFile in $args) {
        $inputPath = [IO.Path]::GetFullPath([string]$inputFile)
        if (@('.xlsx', '.xlsm', '.xls') -notcontains [IO.Path]::GetExtension($inputPath).ToLowerInvariant()) { throw "Not an Excel file: $inputPath" }
        $workbook = $null
        try {
            $workbook = $excel.Workbooks.Open($inputPath, 0, $true)
            $rootType = 'array'
            foreach ($candidate in $workbook.Worksheets) {
                try {
                    if ($candidate.Name -eq '#meta' -and [string]$candidate.Cells.Item(1, 1).Value2 -eq 'rootType') {
                        $rootType = [string]$candidate.Cells.Item(1, 2).Value2
                    }
                } finally { Release-ComObject $candidate }
            }

            if ($rootType -eq 'object') {
                $resultObject = [ordered]@{}
                foreach ($sheet in $workbook.Worksheets) {
                    try {
                        if ($sheet.Name.Contains('#')) { continue }
                        $used = $sheet.UsedRange
                        try {
                            $lastRow = $used.Row + $used.Rows.Count - 1
                            for ($row = 2; $row -le $lastRow; $row++) {
                                $key = $sheet.Cells.Item($row, 1).Value2
                                if (Test-SkipRowByFirstCell $key) { continue }
                                $rawValue = $sheet.Cells.Item($row, 2).Value2
                                if ($rawValue -is [string] -and $rawValue.StartsWith('@json:')) {
                                    $resultObject[[string]$key] = $script:JsonSerializer.DeserializeObject($rawValue.Substring(6))
                                } else {
                                    $resultObject[[string]$key] = From-CellValue $rawValue
                                }
                            }
                        } finally { Release-ComObject $used }
                    } finally { Release-ComObject $sheet }
                }
                $result = [PSCustomObject]$resultObject
            } else {
                $rows = [Collections.ArrayList]::new()
                foreach ($sheet in $workbook.Worksheets) {
                    try {
                        if ($sheet.Name.Contains('#')) { continue }
                        $used = $sheet.UsedRange
                        try {
                            $firstColumn = $used.Column
                            $lastColumn = $used.Column + $used.Columns.Count - 1
                            $lastRow = $used.Row + $used.Rows.Count - 1
                            $headers = @()
                            $seen = @{}
                            for ($column = $firstColumn; $column -le $lastColumn; $column++) {
                                $header = [string]$sheet.Cells.Item(1, $column).Value2
                                if ([string]::IsNullOrWhiteSpace($header)) { $headers += $null; continue }
                                if ($seen.ContainsKey($header)) { throw "Duplicate header '$header' in sheet '$($sheet.Name)'." }
                                $seen[$header] = $true
                                $headers += $header
                            }
                            for ($row = 2; $row -le $lastRow; $row++) {
                                $firstValue = $sheet.Cells.Item($row, 1).Value2
                                if (Test-SkipRowByFirstCell $firstValue) { continue }
                                $item = [ordered]@{}
                                for ($index = 0; $index -lt $headers.Count; $index++) {
                                    if ($null -eq $headers[$index]) { continue }
                                    $rawValue = $sheet.Cells.Item($row, $firstColumn + $index).Value2
                                    if ($rawValue -is [string] -and $rawValue -eq '@json:missing') { continue }
                                    if ($rawValue -is [string] -and $rawValue.StartsWith('@json:')) {
                                        $item[$headers[$index]] = $script:JsonSerializer.DeserializeObject($rawValue.Substring(6))
                                    } else {
                                        $item[$headers[$index]] = From-CellValue $rawValue
                                    }
                                }
                                [void]$rows.Add([PSCustomObject]$item)
                            }
                        } finally { Release-ComObject $used }
                    } finally { Release-ComObject $sheet }
                }
                $result = @($rows)
            }

            $outputPath = Join-Path $jsonDirectory ([IO.Path]::GetFileNameWithoutExtension($inputPath) + '.json')
            $jsonText = ConvertTo-Json -InputObject $result -Depth 100
            # Windows PowerShell may HTML-escape ampersands as \u0026.
            # '&' is valid inside a JSON string, so restore it for game data.
            $jsonText = $jsonText.Replace('\u0026', '&').Replace('\u0026'.ToUpperInvariant(), '&')
            [IO.File]::WriteAllText($outputPath, $jsonText + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
            Write-Output "Created: $outputPath"
        } finally {
            if ($null -ne $workbook) { $workbook.Close($false) }
            Release-ComObject $workbook
        }
    }
} finally {
    if ($null -ne $excel) { $excel.Quit() }
    Release-ComObject $excel
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
