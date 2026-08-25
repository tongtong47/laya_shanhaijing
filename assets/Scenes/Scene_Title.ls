{
  "_$ver": 1,
  "_$id": "n1sjgmmr",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene2D",
  "width": 1080,
  "height": 2400,
  "_$comp": [
    {
      "_$type": "a2eb0023-c286-4d06-a8be-8277afbd1358",
      "scriptPath": "../src/Scenes/Scene_Title.ts",
      "background": {
        "_$ref": "txy31bu5"
      },
      "StartButton": {
        "_$ref": "75zasjlj"
      },
      "langComboBox": {
        "_$ref": "1qq6dhz5"
      },
      "Logo": {
        "_$ref": "4jkk5jhh"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "txy31bu5",
      "_$type": "Image",
      "name": "background",
      "width": 1080,
      "height": 2400,
      "skin": "res://d5d1a8cf-d422-4ee8-806b-602fde7e2ab7",
      "color": "#ffffff"
    },
    {
      "_$id": "75zasjlj",
      "_$type": "Button",
      "name": "StartButton",
      "y": 1420,
      "width": 1080,
      "height": 480,
      "_mouseState": 2,
      "skin": "",
      "label": "探索山海世界",
      "labelFont": "思源宋体",
      "labelSize": 96,
      "labelBold": true,
      "labelColors": "#1e1eeb,#32cc6b,#ff0000",
      "labelAlign": "center",
      "labelVAlign": "middle",
      "labelStroke": 15,
      "labelStrokeColor": "rgba(255, 255, 255, 1)"
    },
    {
      "_$id": "1qq6dhz5",
      "_$type": "ComboBox",
      "name": "langComboBox",
      "x": 410,
      "y": 300,
      "width": 600,
      "height": 180,
      "_mouseState": 2,
      "skin": "res://f64d4387-f2c7-4e48-bea1-a0dfd22a109d",
      "labels": "简体中文,繁体中文,英语,日语,韩语,阿拉伯语,俄罗斯语",
      "labelFont": "思源宋体",
      "labelSize": 60,
      "labelPadding": "0,0,0,40",
      "itemSize": 42,
      "itemPadding": "3,3,3,25",
      "itemColors": "#5e95b6,#6556ff,#000000,#8fa4b1,#e0c952",
      "visibleNum": 8,
      "selectedLabel": "",
      "defaultLabel": ""
    },
    {
      "_$id": "4jkk5jhh",
      "_$type": "Image",
      "name": "Logo",
      "x": 40,
      "y": 750,
      "width": 1000,
      "height": 500,
      "skin": "res://dc3b7467-d6e3-44e2-9ced-d9085e2f89ed",
      "color": "#ffffff"
    }
  ]
}