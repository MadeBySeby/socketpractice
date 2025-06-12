import { Application, Assets, Sprite, Text } from "pixi.js";
import { useRef, useEffect } from "react";

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
          text: data?.multiplier?.toString() || "0",
          style: {
            fill: "#ffffff",
            fontSize: 32,
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
    if (!appRef.current || !multiplierTextRef.current) return;

    const app = appRef.current;
    const multiplierText = multiplierTextRef.current;
    const airplane = airplaneRef.current;
    console.log("Updating text with data:", data);
    multiplierText.text = data?.multiplier?.toString() || "0";

    if (tickerFnRef.current) {
      app.ticker.remove(tickerFnRef.current);
      tickerFnRef.current = null;
    }

    if (airplaneRef.current && data?.multiplier !== undefined) {
      const tickerFn = (delta) => {
        airplane.x += 0.4 * data.multiplier * delta.deltaTime;
        airplane.y -= 0.4 * data.multiplier * delta.deltaTime;

        if (airplane.y > app.screen.height + airplane.height) {
          airplane.y = -airplane.height;
        }
      };

      app.ticker.add(tickerFn);
      tickerFnRef.current = tickerFn;
      if (data?.roundEnd === true) {
        app.ticker.remove(tickerFn);
        tickerFnRef.current = null;
      }
    }

    return () => {
      if (appRef.current && tickerFnRef.current) {
        appRef.current.ticker.remove(tickerFnRef.current);
        tickerFnRef.current = null;
      }
    };
  }, [data?.multiplier]);
  return null;
}
