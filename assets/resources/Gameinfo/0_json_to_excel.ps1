$ErrorActionPreference = 'Stop'

function Get-ArchiveDirectory {
    $dot = [string][char]0x00B7
    return 'E:\Yijue\shanhaijing' + $dot + 'shijie\Doc\GameExcels'
}

function Release-ComObject($value) {
    if ($null -ne $value -and [Runtime.InteropServices.Marshal]::IsComObject($value)) {
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($value)
    }
}

function To-CellValue($value) {
    if ($null -eq $value) { return '@json:null' }
    if ($value -is [Management.Automation.PSCustomObject] -or $value -is [Collections.IDictionary] -or $value -is [Array]) {
        return '@json:' + (ConvertTo-Json -InputObject $value -Depth 100 -Compress)
    }
    if ($value -is [string] -and ($value.StartsWith('@json:') -or $value.StartsWith('@str:'))) {
        return '@str:' + $value
    }
    if ($value -is [byte] -or $value -is [sbyte] -or $value -is [int16] -or $value -is [uint16] -or
        $value -is [int32] -or $value -is [uint32] -or $value -is [int64] -or $value -is [uint64] -or
        $value -is [single] -or $value -is [decimal]) {
        return [double]$value
    }
    return $value
}

function Set-CellValue($cell, $value) {
    # All strings are written as literal text. This preserves '&' and prevents
    # Excel from treating values that contain operators as formulas.
    if ($value -is [string]) {
        $cell.NumberFormat = '@'
        $cell.Value2 = [string]$value
    } elseif ($value -is [double]) {
        $cell.Value2 = [double]$value
    } elseif ($value -is [bool]) {
        $cell.Value2 = [bool]$value
    } else {
        $cell.Value2 = $value
    }
}

function Add-HeaderStyle($sheet, [int]$columnCount) {
    if ($columnCount -le 0) { return }
    $header = $sheet.Range($sheet.Cells.Item(1, 1), $sheet.Cells.Item(1, $columnCount))
    $header.Font.Bold = $true
    $header.Font.Color = 0xFFFFFF
    $header.Interior.Color = 0x996633
    $header.HorizontalAlignment = -4108
    $header.AutoFilter() | Out-Null
    $sheet.Application.ActiveWindow.SplitRow = 1
    $sheet.Application.ActiveWindow.FreezePanes = $true
    $used = $sheet.UsedRange
    $used.Columns.AutoFit() | Out-Null
    for ($column = 1; $column -le $columnCount; $column++) {
        if ($sheet.Columns.Item($column).ColumnWidth -gt 60) { $sheet.Columns.Item($column).ColumnWidth = 60 }
    }
    $used.WrapText = $true
    $used.Rows.AutoFit() | Out-Null
    $used.VerticalAlignment = -4160
    Release-ComObject $used
    Release-ComObject $header
}

if ($args.Count -eq 0) { throw 'Drop one or more JSON files onto 0_json_to_excel.bat.' }

$outputDirectory = Get-ArchiveDirectory
[IO.Directory]::CreateDirectory($outputDirectory) | Out-Null
$excel = $null
try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    foreach ($inputFile in $args) {
        $inputPath = [IO.Path]::GetFullPath([string]$inputFile)
        if ([IO.Path]::GetExtension($inputPath) -ine '.json') { throw "Not a JSON file: $inputPath" }
        $json = [IO.File]::ReadAllText($inputPath, [Text.Encoding]::UTF8) | ConvertFrom-Json
        $workbook = $null
        $sheet = $null
        $metaSheet = $null
        try {
            $workbook = $excel.Workbooks.Add()
            while ($workbook.Worksheets.Count -gt 1) { $workbook.Worksheets.Item($workbook.Worksheets.Count).Delete() }
            $sheet = $workbook.Worksheets.Item(1)
            $sheet.Name = 'data'
            $metaSheet = $workbook.Worksheets.Add()
            $metaSheet.Name = '#meta'

            if ($json -is [Array]) {
                $metaSheet.Cells.Item(1, 1).Value2 = 'rootType'
                $metaSheet.Cells.Item(1, 2).Value2 = 'array'
                $headers = [Collections.Generic.List[string]]::new()
                foreach ($row in $json) {
                    if ($row -is [Management.Automation.PSCustomObject]) {
                        foreach ($property in $row.PSObject.Properties) {
                            if (-not $headers.Contains($property.Name)) { $headers.Add($property.Name) }
                        }
                    } else {
                        if (-not $headers.Contains('value')) { $headers.Add('value') }
                    }
                }
                for ($column = 0; $column -lt $headers.Count; $column++) {
                    Set-CellValue ($sheet.Cells.Item(1, $column + 1)) $headers[$column]
                }
                for ($rowIndex = 0; $rowIndex -lt $json.Count; $rowIndex++) {
                    $row = $json[$rowIndex]
                    for ($column = 0; $column -lt $headers.Count; $column++) {
                        $name = $headers[$column]
                        $isMissing = $false
                        if ($row -is [Management.Automation.PSCustomObject]) {
                            $property = $row.PSObject.Properties[$name]
                            if ($null -eq $property) {
                                $isMissing = $true
                                $value = $null
                            } else {
                                $value = $property.Value
                            }
                        } else {
                            $value = $row
                        }
                        $cellValue = if ($isMissing) { '@json:missing' } else { To-CellValue $value }
                        Set-CellValue ($sheet.Cells.Item($rowIndex + 2, $column + 1)) $cellValue
                    }
                }
                Add-HeaderStyle $sheet $headers.Count
            } else {
                $metaSheet.Cells.Item(1, 1).Value2 = 'rootType'
                $metaSheet.Cells.Item(1, 2).Value2 = 'object'
                $sheet.Cells.Item(1, 1).Value2 = 'key'
                $sheet.Cells.Item(1, 2).Value2 = 'value'
                $rowIndex = 2
                foreach ($property in $json.PSObject.Properties) {
                    Set-CellValue ($sheet.Cells.Item($rowIndex, 1)) ([string]$property.Name)
                    $cellValue = To-CellValue ($property.Value)
                    Set-CellValue ($sheet.Cells.Item($rowIndex, 2)) $cellValue
                    $rowIndex++
                }
                Add-HeaderStyle $sheet 2
            }

            $metaSheet.Visible = 0
            $outputPath = Join-Path $outputDirectory ([IO.Path]::GetFileNameWithoutExtension($inputPath) + '.xlsx')
            if (Test-Path -LiteralPath $outputPath) { Remove-Item -LiteralPath $outputPath -Force }
            $workbook.SaveAs($outputPath, 51)
            Write-Output "Created: $outputPath"
        } finally {
            if ($null -ne $workbook) { $workbook.Close($false) }
            Release-ComObject $metaSheet
            Release-ComObject $sheet
            Release-ComObject $workbook
        }
    }
} finally {
    if ($null -ne $excel) { $excel.Quit() }
    Release-ComObject $excel
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
