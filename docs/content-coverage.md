# Content coverage

Checked on 2026-11-22 for passenger cars. There are 20 verified inventory entries and 20 verified questions, including seven with configured scenes. No pending entries are shipped. The official catalogue extends beyond this selection.

| Category                 | Verified entries / questions | Published examples                                                          |
| ------------------------ | ---------------------------: | --------------------------------------------------------------------------- |
| Regulatory               |                        6 / 6 | Stop, slow, no entry, one way, no U-turn, no parking during displayed hours |
| Warning                  |                        2 / 2 | Railway crossing, animals entering the road (deer)                          |
| Indication               |                        1 / 1 | Pedestrian crossing                                                         |
| Guide                    |                        1 / 1 | Municipality name                                                           |
| Supplementary            |                        1 / 1 | Days and hours                                                              |
| Road markings            |                        1 / 1 | Designated lane directions                                                  |
| Traffic signals          |                        1 / 1 | Steady red without an arrow or officer direction                            |
| Driving obligations      |                        3 / 3 | Keep left, report crashes, stop and check at an unsignalised rail crossing  |
| Hokkaido winter guidance |                        4 / 4 | Black ice, visibility and speed, following distance, rental-car ABS         |

The wildlife warning is a nationwide sign. The winter collection draws on Hokkaido regional guidance. Winter advice is presented separately from binding rules. The playable scenes cover stop-sign junctions, pedestrian crossings, railway crossings, red lights, lane choices, ice and blowing snow.

## Evidence and asset credits

- NPA and prefectural police. Page 1 identifies signs, signals and lane directions. Page 2, sections 1, 2, 4, 5 and 8 cover keeping left, crash reporting, crossings and stop signs. [Follow the rules and drive safely in Japan](https://www.npa.go.jp/english/bureau/traffic/document/r8_followtherules_en02.pdf)
- MLIT. Official Japanese names and artwork were checked against the numbered catalogue. The 11 raster sign images are RoadLab crops of this sheet, including the 8–20 parking sign and the corresponding hours plate example. The municipality sign is an illustrative place name. [道路標識一覧](https://www.mlit.go.jp/road/sign/sign/douro/ichiran.pdf)
- The sign crops are attributed to 国土交通省 and edited by RoadLab under Public Data License 1.0. RoadLab designed the scene and dashboard SVGs. [MLIT website reuse terms](https://www.mlit.go.jp/link.html) · [PDL 1.0](https://www.digital.go.jp/resources/open_data/public_data_license_v1.0)
- Hokkaido Regional Development Bureau. Page 1 describes black ice, reduced visibility, safe distance, appropriate speed and rental-car ABS. [Winter Driving – Drive Safely in Ice and Snow](https://hokkaido-safe-travel.mlit.go.jp/images/pdf/winter_drive_eng.pdf)

## Gaps

Complex supplementary combinations, most guide signs, road markings, flashing signals, vehicle-specific exemptions and detailed winter rental equipment rules await verification. No catalogue-wide coverage percentage is claimed. New legal edge cases need current ordinance or statute references and independent language review.

## Urban driving scenarios

The 3D market, station and civic routes simulate ordinary passenger cars at signalised intersections with permissive turns. The approach and opposing through traffic receive plain circular green together. Pedestrians can receive walk on the parallel crossing across the turn exit. Each road user follows the signal facing them. A right-turning car yields to opposing through traffic. At a crosswalk the driver stops and gives priority to pedestrians crossing or about to cross. The scenarios use simulated approach gaps and crossing occupancy for training feedback. These values are game parameters.

Checked 2026-11-26 against the signal table in Article 2 of the Enforcement Order and the NPA's guidance on intersections (page 2, section 6). The driving routes do not change the scored question inventory. [道路交通法施行令](https://laws.e-gov.go.jp/law/335CO0000000270) · [National Police Agency driving guide](https://www.npa.go.jp/english/bureau/traffic/document/r8_followtherules_en02.pdf)

## Driving decision lessons

Checked 2026-11-27 for ordinary passenger cars. Civic Avenue has three reproducible schedules covering cars clearing first, pedestrians clearing first, and a walk signal with an empty crossing. Five additional cockpit lessons use the following evidence.

| Lesson                           | Authority and application                                                                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Station exit queue               | Road Traffic Act, Article 50(1–2), on entering when downstream congestion would obstruct the intersection or cause a vehicle to stop on a crossing. The simulated queue leaves insufficient space beyond the zebra stripes. |
| Delivery van and shopper         | Road Traffic Act, Article 38(1), on approach speed where the crossing may be occupied, stopping and yielding. The van obscures an unsignalised crossing before the signalised junction.                                     |
| Left turn beside a cyclist       | Articles 34(1) and 70 cover left turns and safe operation. The reflected left-side camera and shoulder check are observation aids. The game evaluates the overlap with the rider.                                           |
| Marked right-turn lane and arrow | Article 35(1) covers designated lanes. The Enforcement Order, Article 2 signal table, permits the direction shown by an illuminated green arrow. The model has a red circular lamp and a separate right arrow.              |
| Hokkaido winter approach         | Article 26 covers following distance. The regional winter guide describes extended stopping distances on packed snow and ice. Grip, visibility and operating margins in the simulation are coaching parameters.             |

[Road Traffic Act](https://laws.e-gov.go.jp/law/335AC0000000105) · [Enforcement Order](https://laws.e-gov.go.jp/law/335CO0000000270) · [Hokkaido winter driving guide, p. 1](https://hokkaido-safe-travel.mlit.go.jp/images/pdf/winter_drive_eng.pdf)

## Forty field drives

Five playable routes each cover school and residential streets, public transport, shopping streets, roadworks, rail crossings, country roads, harbour roads and Hokkaido winter roads. Each has an ordered set of three encounters. For example, the morning school gate combines a 20 km/h zone, two pedestrians arriving from opposite sides and a stop-controlled side street. At the station drop-off, a red signal precedes a queue blocking the far side of a pedestrian crossing. Players encounter both a moving pedestrian and limited exit space there.

Japanese ordinary passenger cars in left-hand traffic are the reference vehicle. The training rules draw on the Road Traffic Act, Articles 22 (speed), 26 (following distance), 33 (railway crossings), 38 (pedestrian crossings) and 43 (designated stops). Railway exercises depict crossings without a controlling road traffic signal. The NPA guide covers stopping at level crossings and giving way at pedestrian crossings. Winter grip, signal timers, wildlife paths and cone clearances are gameplay parameters. Source passages checked 2026-11-28. [Road Traffic Act](https://laws.e-gov.go.jp/law/335AC0000000105) · [NPA driving guide](https://www.npa.go.jp/english/bureau/traffic/document/r8_followtherules_en02.pdf) · [Hokkaido winter driving](https://hokkaido-safe-travel.mlit.go.jp/images/pdf/winter_drive_eng.pdf)

The open-road game draws these situations from a shuffled pool with the town and urban junction layouts. Each field street varies checkpoint placement and cycles its signals on the simulation clock. The existing driving rules and sources apply throughout a trip.
