import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Text,
} from "pixi.js";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
export default function PixiGame(data) {
  const appRef = useRef(null);
  const airplaneRef = useRef(null);
  const tickerFnRef = useRef(null);
  const isInitializedRef = useRef(false);
  const multiplierTextRef = useRef(null);
  // Initialize PIXI app once when component mounts
  useEffect(() => {
    if (isInitializedRef.current) return;

    let isMounted = true;

    const initApp = async () => {
      try {
        const app = new Application();
        await app.init({
          width: window.innerWidth / 1.25,
          height: window.innerHeight / 2,
          backgroundColor: 0x000000,
          transparent: true,
        });

        if (!isMounted) {
          app.destroy(true, true);
          return;
        }
        const backgroundTexture = await Assets.load("/backgroundimg.png");
        const background = new Sprite(backgroundTexture);
        const airplaneTexture = await Assets.load("/airplane.png");
        const airplane = new Sprite(airplaneTexture);
        airplaneRef.current = airplane;
        app.stage.addChild(airplane);
        airplane.anchor.set(0.5);
        airplane.x = 0;
        airplane.y = app.screen.height - airplane.height / 2;
        const multiplierText = new Text({
          text:
            data?.multiplier?.toString() ||
            data?.lastMultiplier?.toString() ||
            "0",
          fontFamily: "Arial",
          style: {
            fill: "#ffffff",
            fontSize: 50,
          },
        });
        multiplierText.x = app.screen.width / 2;
        multiplierText.y = app.screen.height / 2 - 10;
        multiplierText.anchor.set(0.5);
        app.stage.addChild(multiplierText);
        multiplierTextRef.current = multiplierText;
        background.anchor.set(0.5);
        background.width = app.screen.width;
        background.height = app.screen.height;
        app.stage.addChildAt(background, 0);
        if (app.screen.width > app.screen.height) {
          background.width = app.screen.width * 1.2;
          background.scale.y = background.scale.x;
        } else {
          background.height = app.screen.height * 1.2;
          background.scale.x = background.scale.y;
        }
        background.x = app.screen.width / 2;
        background.y = app.screen.height / 2;

        const airplaneContainer = new Container();

        airplaneContainer.addChild(airplane);
        app.stage.addChild(airplaneContainer);

        // const texture = await Assets.load("/bird.png");
        // const bird = new Sprite(texture);
        // bird.anchor.set(0.5);
        // bird.x = app.screen.width / 2;
        // bird.y = 0;
        // birdRef.current = bird;

        // app.stage.addChild(bird);

        const container = document.getElementById("pixi-container");
        if (container && isMounted) {
          container.innerHTML = "";
          container.appendChild(app.canvas);
        }

        appRef.current = app;
        isInitializedRef.current = true;
        console.log("PIXI app initialized");
      } catch (error) {
        console.error("Error initializing PIXI app:", error);
      }
    };

    initApp();

    return () => {
      isMounted = false;
      if (tickerFnRef.current && appRef.current) {
        appRef.current.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
      if (appRef.current) {
        try {
          appRef.current.destroy(true, true);
        } catch (error) {
          console.error("Error destroying PIXI app:", error);
        }
        appRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!multiplierTextRef.current) return;

    const multiplierText = multiplierTextRef.current;
    multiplierText.text = data?.multiplier?.toString() || "";
    multiplierText.style.fill =
      data?.multiplier === data?.lastMultiplierForPixi ? "#ff0000" : "#ffffff";
  }, [data?.multiplier]);

  useEffect(() => {
    if (!appRef.current || !airplaneRef.current) return;

    const app = appRef.current;
    const airplane = airplaneRef.current;

    // Clean up existing ticker
    if (tickerFnRef.current) {
      app.ticker.remove(tickerFnRef.current);
      tickerFnRef.current = null;
    }

    // Kill any existing animations
    // gsap.killTweensOf(airplane);
    if (!data?.multiplier) {
      gsap.killTweensOf(airplane);
      airplane.x = 0;
      airplane.y = app.screen.height - airplane.height / 2;
      return;
    }
    if (data?.roundEnd === true) {
      // console.log("Flight finished (round over or crashed)");
      gsap.to(airplane, {
        x: app.screen.width * 2,
        y: airplane.y,
        duration: 4,
        ease: "power1.out",
        // onComplete: () => {
        //   airplane.x = 0;
        //   airplane.y = app.screen.height - airplane.height / 2;
        //   return;
        // },
      });
    } else {
      gsap.to(airplane, {
        x: app.screen.width - 200,
        y: 100,
        duration: 2,
        ease: "linear",

        onUpdate: () => {
          if (airplane.x >= app.screen.width - 300) {
            gsap.to(airplane, {
              x: app.screen.width - 200,
              y: 100 - Math.sin(Date.now() / 500) * 50,
              duration: 1,
              ease: "linear",
            });
          }
        },
      });
    }

    return () => {
      if (appRef.current && tickerFnRef.current) {
        appRef.current.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
      // Clean up animations on unmount
      if (airplane) {
        gsap.killTweensOf(airplane);
      }
    };
  }, [data?.roundEnd, data?.multiplier]);
  return null;
}
