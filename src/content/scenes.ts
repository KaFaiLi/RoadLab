type Scene = {
  road: "junction" | "straight" | "multi";
  feature?: "stop" | "crossing" | "signal" | "rail" | "arrows";
  weather: "clear" | "ice" | "snow";
  actors: ("car" | "pedestrian" | "bicycle" | "obstacle")[];
  daylight: "day" | "dusk";
};
export const scenes: Record<string, Scene> = {
  junction: {
    road: "junction",
    feature: "stop",
    weather: "clear",
    actors: ["car"],
    daylight: "day",
  },
  crosswalk: {
    road: "straight",
    feature: "crossing",
    weather: "clear",
    actors: ["car", "pedestrian"],
    daylight: "day",
  },
  tracks: {
    road: "straight",
    feature: "rail",
    weather: "clear",
    actors: ["car"],
    daylight: "day",
  },
  lights: {
    road: "junction",
    feature: "signal",
    weather: "clear",
    actors: ["car"],
    daylight: "dusk",
  },
  lanes: {
    road: "multi",
    feature: "arrows",
    weather: "clear",
    actors: ["car"],
    daylight: "day",
  },
  ice: { road: "straight", weather: "ice", actors: ["car"], daylight: "dusk" },
  blizzard: {
    road: "straight",
    weather: "snow",
    actors: ["car"],
    daylight: "day",
  },
};
