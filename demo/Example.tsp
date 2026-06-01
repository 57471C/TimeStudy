{
  "projectMeta": {
    "projectName": "Example",
    "projectComments": "Example project",
    "partsList": [
      "ABC123 - Widget"
    ],
    "labourList": [
      "1001 - Assembly",
      "1002 - Packaging",
      "1003 - Soldering"
    ],
    "lastSaved": "2026-06-01T12:20:17.018Z",
    "appVersion": "0.6.7"
  },
  "appConfig": {
    "playbackSpeed": 1,
    "volumeLevel": 1
  },
  "trials": [
    {
      "trialId": 1,
      "trialName": "Current State",
      "videoFileName": "Robot.mp4",
      "videoFilePath": "C:\\Scripts\\TimeStudy\\demo\\Robot.mp4",
      "processStartTime": 0,
      "processEndTime": 10,
      "taktTime": 9000,
      "costingConfig": {
        "hourlyRate": 0,
        "shiftLength": 480,
        "targetEfficiency": 100,
        "unitsPerCycle": 1
      },
      "appState": {
        "operations": [
          {
            "name": "Assembly Start",
            "startTime": 0,
            "partTags": [],
            "tasks": [
              {
                "name": "Place 1st part",
                "duration": 683.8389999999999,
                "status": "NVA",
                "partTags": [],
                "labourTags": [
                  "1001 - Assembly"
                ]
              },
              {
                "name": "Place 2nd part",
                "duration": 1021.8580000000002,
                "status": "NVA",
                "partTags": [],
                "labourTags": [
                  "1001 - Assembly"
                ]
              },
              {
                "name": "Place 3rd part",
                "duration": 886.2089999999998,
                "status": "NVA",
                "partTags": [],
                "labourTags": [
                  "1001 - Assembly"
                ]
              },
              {
                "name": "Solder",
                "duration": 3122.9089999999997,
                "status": "VA",
                "partTags": [],
                "labourTags": [
                  "1003 - Soldering"
                ]
              },
              {
                "name": "Place in box",
                "duration": 2463.068,
                "status": "NVA",
                "partTags": [],
                "labourTags": [
                  "1002 - Packaging"
                ]
              },
              {
                "name": "Seal box",
                "duration": 1453.941999999999,
                "status": "VA",
                "partTags": [],
                "labourTags": [
                  "1002 - Packaging"
                ]
              }
            ]
          }
        ]
      }
    }
  ],
  "activeTrialIndex": 0
}