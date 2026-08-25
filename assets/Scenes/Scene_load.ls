{
  "_$ver": 1,
  "_$id": "lx8mwule",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene_load",
  "width": 1080,
  "height": 2400,
  "_$comp": [
    {
      "_$type": "b2a1903f-a701-43a2-b6b4-45b212574e10",
      "scriptPath": "../src/Scenes/Scene_load.ts",
      "object_load_bg": {
        "_$ref": "z9cfq27p"
      },
      "jindutiao_Box": {
        "_$ref": "txocigrc"
      },
      "ProgressBar": {
        "_$ref": "68ti266n"
      },
      "percentage_Label": {
        "_$ref": "xzyaxvre"
      },
      "Logo": {
        "_$ref": "itzec9og"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "z9cfq27p",
      "_$type": "Image",
      "name": "object_load_bg",
      "width": 1080,
      "height": 2400,
      "skin": "res://53c1e486-c939-4a7c-9bee-6c04c09a84c7",
      "color": "#ffffff"
    },
    {
      "_$id": "txocigrc",
      "_$type": "Box",
      "name": "jindutiao_Box",
      "y": 2000,
      "width": 1080,
      "height": 200,
      "_$child": [
        {
          "_$id": "68ti266n",
          "_$type": "ProgressBar",
          "name": "ProgressBar",
          "x": 40,
          "y": 68,
          "width": 1000,
          "height": 64,
          "skin": "res://c4845cca-abb4-4e4a-9e06-c7b6b52a88fd",
          "value": 0.528
        },
        {
          "_$id": "xzyaxvre",
          "_$type": "Label",
          "name": "percentage_Label",
          "x": 456,
          "y": 70,
          "width": 168,
          "height": 60,
          "text": "99%",
          "font": "思源宋体",
          "fontSize": 42,
          "color": "#FFFFFF",
          "bold": true,
          "align": "center",
          "valign": "bottom",
          "padding": "0,0,0,0",
          "stroke": 5
        }
      ]
    },
    {
      "_$id": "itzec9og",
      "_$type": "Image",
      "name": "Logo",
      "x": 40,
      "y": 1217,
      "width": 1000,
      "height": 500,
      "skin": "res://dc3b7467-d6e3-44e2-9ced-d9085e2f89ed",
      "color": "#ffffff"
    }
  ]
}