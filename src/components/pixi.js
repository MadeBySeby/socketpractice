import { Application, Assets, Sprite, Text } from "pixi.js";
import { useRef, useEffect } from "react";

export default function PixiGame(data) {
  const appRef = useRef(null);
  const birdRef = useRef(null);
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
          width: window.innerWidth / 2,
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
        background.width = app.screen.width;
        background.height = app.screen.height;
        app.stage.addChild(background);
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
    if (!appRef.current || !birdRef.current || !multiplierTextRef.current)
      return;

    const app = appRef.current;
    const bird = birdRef.current;
    const multiplierText = multiplierTextRef.current;
    console.log(data);
    multiplierText.text = data?.multiplier?.toString() || "0";
    const tickerFn = (delta) => {
      if (data?.multiplier) {
        // Update bird position based on multiplier
        bird.y += 0.1 * data.multiplier;
        // You can also add more complex animations or behaviors here
      }
    };
    app.ticker.add(tickerFn);
    tickerFnRef.current = tickerFn;

    // Remove ticker if multiplier is undefined
    if (data?.multiplier === undefined) {
      app.ticker.remove(tickerFn);
      tickerFnRef.current = null;
    }
    return () => {
      if (appRef.current && tickerFnRef.current) {
        appRef.current.ticker.remove(tickerFnRef.current);
      }
    };
  }, [data]);

  return null;
}
