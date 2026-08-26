{
  "_$ver": 1,
  "_$id": "uebc5d1r",
  "_$type": "Scene",
  "left": 0,
  "right": 0,
  "top": 0,
  "bottom": 0,
  "name": "Scene_World",
  "width": 1080,
  "height": 2400,
  "_$comp": [
    {
      "_$type": "8a3300f4-32e8-4c19-8f22-45150c876837",
      "scriptPath": "../src/Scenes/Scene_World.ts",
      "background": {
        "_$ref": "fsub6f5x"
      },
      "ControlBox": {
        "_$ref": "h1icfzdp"
      },
      "Bigmap": {
        "_$ref": "751qrs71"
      },
      "Botton_Home_a": {
        "_$ref": "xj3p2tbt"
      },
      "Botton_Home_m": {
        "_$ref": "9mktqtm6"
      },
      "Botton_Home_Label": {
        "_$ref": "p91zpzex"
      },
      "Botton_Mountains_a": {
        "_$ref": "1leajfjf"
      },
      "Botton_Mountains_m": {
        "_$ref": "bkthrbo7"
      },
      "Botton_Mountains_Label": {
        "_$ref": "pjigejtq"
      },
      "Botton_Seas_a": {
        "_$ref": "06k4eb8f"
      },
      "Botton_Seas_m": {
        "_$ref": "m55g4d2p"
      },
      "Botton_Seas_Label": {
        "_$ref": "qjjco1ks"
      },
      "Botton_Myth_a": {
        "_$ref": "ahbct7z3"
      },
      "Botton_Myth_m": {
        "_$ref": "sb6y1lts"
      },
      "Botton_myth_Label": {
        "_$ref": "zltdg9yw"
      },
      "Mountains_choose": {
        "_$ref": "vh0qz7kg"
      },
      "Seas_choose": {
        "_$ref": "1l8zv4cp"
      }
    }
  ],
  "_$child": [
    {
      "_$id": "fsub6f5x",
      "_$type": "Sprite",
      "name": "background",
      "width": 4000,
      "height": 4000,
      "_$child": [
        {
          "_$id": "h1icfzdp",
          "_$type": "Box",
          "name": "ControlBox",
          "width": 1080,
          "height": 2400,
          "_$child": [
            {
              "_$id": "751qrs71",
              "_$type": "Image",
              "name": "Bigmap",
              "width": 4000,
              "height": 4000,
              "skin": "res://6bbeeb99-fa49-43cf-ba33-adcc4d85b923",
              "color": "#ffffff"
            }
          ]
        }
      ]
    },
    {
      "_$id": "xj3p2tbt",
      "_$type": "Image",
      "name": "Botton_Home_a",
      "y": 1920,
      "width": 270,
      "height": 270,
      "skin": "res://d728c86e-983d-4d83-afac-78304109426f",
      "color": "#ffffff",
      "_$child": [
        {
          "_$id": "9mktqtm6",
          "_$type": "Image",
          "name": "Botton_Home_m",
          "width": 270,
          "height": 270,
          "visible": false,
          "skin": "res://5192d42e-d879-4e9a-970c-0160c41ad308",
          "color": "#ffffff"
        },
        {
          "_$id": "p91zpzex",
          "_$type": "Label",
          "name": "Botton_Home_Label",
          "y": 210,
          "width": 270,
          "height": 60,
          "text": "主页",
          "font": "思源宋体",
          "fontSize": 55,
          "color": "#FFFFFF",
          "bold": true,
          "align": "center",
          "valign": "middle",
          "wordWrap": true,
          "padding": "0,0,0,0",
          "stroke": 5
        }
      ]
    },
    {
      "_$id": "1leajfjf",
      "_$type": "Image",
      "name": "Botton_Mountains_a",
      "x": 270,
      "y": 1920,
      "width": 270,
      "height": 270,
      "skin": "res://2e77d0df-0c58-4e2b-b33b-f7501e02b3e2",
      "color": "#ffffff",
      "_$child": [
        {
          "_$id": "bkthrbo7",
          "_$type": "Image",
          "name": "Botton_Mountains_m",
          "width": 270,
          "height": 270,
          "visible": false,
          "skin": "res://29906cb5-36d8-4964-8f74-958bbec8378e",
          "color": "#ffffff"
        },
        {
          "_$id": "pjigejtq",
          "_$type": "Label",
          "name": "Botton_Mountains_Label",
          "y": 210,
          "width": 270,
          "height": 60,
          "text": "山经",
          "font": "思源宋体",
          "fontSize": 55,
          "color": "#FFFFFF",
          "bold": true,
          "align": "center",
          "valign": "middle",
          "wordWrap": true,
          "padding": "0,0,0,0",
          "stroke": 5
        }
      ]
    },
    {
      "_$id": "06k4eb8f",
      "_$type": "Image",
      "name": "Botton_Seas_a",
      "x": 540,
      "y": 1920,
      "width": 270,
      "height": 270,
      "skin": "res://19da7d62-8e99-44f7-8e20-c3d1e6365d72",
      "color": "#ffffff",
      "_$child": [
        {
          "_$id": "m55g4d2p",
          "_$type": "Image",
          "name": "Botton_Seas_m",
          "width": 270,
          "height": 270,
          "visible": false,
          "skin": "res://946185be-fbb5-48ae-86ed-d2d98a857438",
          "color": "#ffffff"
        },
        {
          "_$id": "qjjco1ks",
          "_$type": "Label",
          "name": "Botton_Seas_Label",
          "y": 210,
          "width": 270,
          "height": 60,
          "text": "海经",
          "font": "思源宋体",
          "fontSize": 55,
          "color": "#FFFFFF",
          "bold": true,
          "align": "center",
          "valign": "middle",
          "wordWrap": true,
          "padding": "0,0,0,0",
          "stroke": 5
        }
      ]
    },
    {
      "_$id": "ahbct7z3",
      "_$type": "Image",
      "name": "Botton_Myth_a",
      "x": 810,
      "y": 1920,
      "width": 270,
      "height": 270,
      "skin": "res://bf342d62-0741-4fd0-9346-904dd839bd72",
      "color": "#ffffff",
      "_$child": [
        {
          "_$id": "sb6y1lts",
          "_$type": "Image",
          "name": "Botton_Myth_m",
          "width": 270,
          "height": 270,
          "visible": false,
          "skin": "res://fc60a2a8-8fe7-4b12-b3e2-6bb7b059846e",
          "color": "#ffffff"
        },
        {
          "_$id": "zltdg9yw",
          "_$type": "Label",
          "name": "Botton_myth_Label",
          "y": 210,
          "width": 270,
          "height": 60,
          "text": "神话",
          "font": "思源宋体",
          "fontSize": 55,
          "color": "#FFFFFF",
          "bold": true,
          "align": "center",
          "valign": "middle",
          "wordWrap": true,
          "padding": "0,0,0,0",
          "stroke": 5
        }
      ]
    },
    {
      "_$id": "vh0qz7kg",
      "_$prefab": "e1d61084-e11b-420b-aaee-43d29a6a6d0e",
      "name": "Mountains_choose",
      "active": true,
      "x": 0,
      "y": 0,
      "visible": false
    },
    {
      "_$id": "90ch4ab3",
      "_$prefab": "0e47285c-c9b6-485b-8ffb-1b2f2e4d5a26",
      "name": "Mountains",
      "active": true,
      "x": 0,
      "y": 0,
      "visible": false
    },
    {
      "_$id": "1l8zv4cp",
      "_$prefab": "e8060520-89e6-486c-a64d-2be2b8c6bbc3",
      "name": "Seas_choose",
      "active": true,
      "x": 0,
      "y": 0,
      "visible": false
    },
    {
      "_$id": "s3i898i0",
      "_$prefab": "f697a919-bc59-4105-9fa6-6e1c7deb1c24",
      "name": "Seas",
      "active": true,
      "x": 0,
      "y": 0,
      "visible": false
    }
  ]
}