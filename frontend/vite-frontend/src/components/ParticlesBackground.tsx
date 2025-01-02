import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground: React.FC = () => {
  const particlesInit = async (main: any) => {
    // Loads full tsparticles package
    await loadFull(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true },
        background: {
          color: {
            value: "#1a1a1a", // Matches your current background color
          },
        },
        particles: {
          number: {
            value: 80, // Adjust the number of particles
            density: {
              enable: true,
              area: 800, // Particles density area
            },
          },
          color: {
            value: "#61dafb", // Blue particles color
          },
          shape: {
            type: "circle", // Other options: "star", "edge", "polygon"
          },
          opacity: {
            value: 0.5,
            random: false,
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
              sync: false,
            },
          },
          size: {
            value: 3,
            random: true,
            animation: {
              enable: true,
              speed: 5,
              minimumValue: 0.1,
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none", // Can be "top", "bottom", etc.
            random: false,
            straight: false,
            outModes: "out", // Particles move out of the canvas area
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse", // Particles repel when hovered
            },
            onClick: {
              enable: true,
              mode: "push", // Adds more particles on click
            },
          },
        },
        detectRetina: true, // Optimizes for high-DPI screens
      }}
    />
  );
};

export default ParticlesBackground;
