interface NewSpaceMarine {
  name: string;
  coordinates: NewCoordinates;
  chapter?: NewChapter;
  health?: number;
  heartCount: number;
}

interface NewCoordinates {
  x: number;
  y: number;
}

interface NewChapter {
  name: string;
  world: string;
}

export const validateSpaceMarine = (spaceMarine: NewSpaceMarine): void => {
  if (!spaceMarine) {
    throw new Error("SpaceMarine object cannot be null");
  }

  validateName(spaceMarine.name);
  validateCoordinates(spaceMarine.coordinates);

  if (spaceMarine.chapter) {
    validateChapter(spaceMarine.chapter);
  }

  validateHealth(spaceMarine.health);
  validateHeartCount(spaceMarine.heartCount);
};

const validateName = (name: string): void => {
  if (!name || name.trim() === "") {
    throw new Error("Name cannot be null or empty");
  }
};

const validateCoordinates = (coordinates: NewCoordinates): void => {
  if (!coordinates) {
    throw new Error("Coordinates cannot be null");
  }

  if (typeof coordinates.x !== "number" || coordinates.x > 761) {
    throw new Error("X coordinate must be a number less than or equal to 761");
  }

  if (typeof coordinates.y !== "number" || coordinates.y <= -352) {
    throw new Error("Y coordinate must be a number greater than -352");
  }
};

const validateChapter = (chapter: NewChapter): void => {
  if (!chapter) {
    throw new Error("Chapter cannot be null");
  }

  validateName(chapter.name);

  if (!chapter.world || chapter.world.trim() === "") {
    throw new Error("Chapter world cannot be null or empty");
  }
};

const validateHealth = (health?: number): void => {
  if (health !== undefined && (typeof health !== "number" || health <= 0)) {
    throw new Error("Health must be a number greater than 0");
  }
};

const validateHeartCount = (heartCount: number): void => {
  if (typeof heartCount !== "number" || heartCount <= 0 || heartCount > 3) {
    throw new Error(
      "Heart count must be a number greater than 0 and less than or equal to 3"
    );
  }
};
