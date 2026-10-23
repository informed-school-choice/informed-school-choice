'use strict';
window.POLICY_DATA = {
  "sourceVersion": "October 2026 manuscript",
  "baseline": {
    "title": "Information, at scale",
    "tag": "100% take-up",
    "values": [
      [
        0.558,
        0.678,
        0.621,
        0.71
      ],
      [
        0.298,
        0.488,
        0.413,
        0.524
      ],
      [
        0.512,
        0.648,
        0.586,
        0.681
      ]
    ],
    "effects": [
      [
        0,
        0.12,
        0.063,
        0.152
      ],
      [
        0,
        0.191,
        0.115,
        0.226
      ],
      [
        0,
        0.136,
        0.074,
        0.17
      ]
    ],
    "se": [
      [
        null,
        0.045,
        0.024,
        0.041
      ],
      [
        null,
        0.074,
        0.057,
        0.061
      ],
      [
        null,
        0.085,
        0.062,
        0.075
      ]
    ],
    "sourceTable": "CapacityCounterfactualTable.tex",
    "sourcePanel": "A/B",
    "sourceVersion": "October 2026 manuscript",
    "researchSourceCommit": "0803db2475ed08a49338f3208eb83fec238a50ed",
    "includedInCurrentManuscript": true
  },
  "takeup75": {
    "title": "Reaching three in four families",
    "tag": "75% take-up",
    "values": [
      [
        0.558,
        0.651,
        0.607,
        0.691
      ],
      [
        0.298,
        0.44,
        0.385,
        0.482
      ],
      [
        0.512,
        0.622,
        0.573,
        0.664
      ]
    ],
    "sourceTable": "CounterfactualRobustness.tex",
    "sourcePanel": "E",
    "sourceVersion": "September 2026 research-source release",
    "researchSourceCommit": "0b3f98a8eaa3bc68cad6840386a2a71611d9de1a",
    "includedInCurrentManuscript": false
  },
  "takeup50": {
    "title": "Reaching half of eligible families",
    "tag": "50% take-up",
    "values": [
      [
        0.558,
        0.622,
        0.594,
        0.655
      ],
      [
        0.298,
        0.396,
        0.361,
        0.433
      ],
      [
        0.512,
        0.588,
        0.556,
        0.621
      ]
    ],
    "sourceTable": "CounterfactualRobustness.tex",
    "sourcePanel": "F",
    "sourceVersion": "September 2026 research-source release",
    "researchSourceCommit": "0b3f98a8eaa3bc68cad6840386a2a71611d9de1a",
    "includedInCurrentManuscript": false
  },
  "sepOnly": {
    "title": "Target disadvantaged families",
    "tag": "SEP families only",
    "values": [
      [
        0.558,
        0.621,
        0.595,
        0.655
      ],
      [
        0.298,
        0.483,
        0.442,
        0.517
      ],
      [
        0.512,
        0.512,
        0.487,
        0.552
      ]
    ],
    "sourceTable": "CounterfactualRobustness.tex",
    "sourcePanel": "B",
    "sourceVersion": "September 2026 research-source release",
    "researchSourceCommit": "0b3f98a8eaa3bc68cad6840386a2a71611d9de1a",
    "includedInCurrentManuscript": false
  },
  "nonSepOnly": {
    "title": "Target other eligible families",
    "tag": "Non-SEP families only",
    "values": [
      [
        0.558,
        0.616,
        0.588,
        0.638
      ],
      [
        0.298,
        0.298,
        0.272,
        0.331
      ],
      [
        0.512,
        0.656,
        0.618,
        0.671
      ]
    ],
    "sourceTable": "CounterfactualRobustness.tex",
    "sourcePanel": "C",
    "sourceVersion": "September 2026 research-source release",
    "researchSourceCommit": "0b3f98a8eaa3bc68cad6840386a2a71611d9de1a",
    "includedInCurrentManuscript": false
  },
  "cost10": {
    "title": "When quality is more costly",
    "tag": "+10% marginal cost",
    "values": [
      [
        0.558,
        0.678,
        0.621,
        0.602
      ],
      [
        0.298,
        0.488,
        0.413,
        0.442
      ],
      [
        0.512,
        0.648,
        0.586,
        0.579
      ]
    ],
    "effects": [
      [
        0,
        0.12,
        0.063,
        0.044
      ],
      [
        0,
        0.191,
        0.115,
        0.144
      ],
      [
        0,
        0.136,
        0.074,
        0.067
      ]
    ],
    "se": [
      [
        null,
        0.045,
        0.024,
        null
      ],
      [
        null,
        0.074,
        0.057,
        null
      ],
      [
        null,
        0.085,
        0.062,
        null
      ]
    ],
    "sourceTable": "CapacityCounterfactualTable.tex",
    "sourcePanel": "A/B",
    "sourceVersion": "October 2026 manuscript",
    "researchSourceCommit": "0803db2475ed08a49338f3208eb83fec238a50ed",
    "includedInCurrentManuscript": true
  },
  "publicResponds": {
    "title": "If public schools also respond",
    "tag": "Public-school response",
    "values": [
      [
        0.558,
        0.68,
        0.619,
        0.771
      ],
      [
        0.298,
        0.483,
        0.407,
        0.6
      ],
      [
        0.512,
        0.656,
        0.588,
        0.749
      ]
    ],
    "sourceTable": "CounterfactualRobustness.tex",
    "sourcePanel": "D",
    "sourceVersion": "September 2026 research-source release",
    "researchSourceCommit": "0b3f98a8eaa3bc68cad6840386a2a71611d9de1a",
    "includedInCurrentManuscript": false
  }
};
