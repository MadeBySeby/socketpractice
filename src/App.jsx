import React, { useState, useEffect } from "react";
import { socket } from "./socket";

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [inputMessage, setInputMessage] = useState("");
  const [currentBet, setCurrentBet] = useState();
  const [gameEvents, setGameEvents] = useState([]);
  const [round, setRound] = useState(gameEvents?.map((e) => e.round_id));
  const [multiplier, setMultipier] = useState();
  const [countdown, setCountDown] = useState();
  const [roundEnd, setRoundEnd] = useState(false);
  const [betPlaced, setBetPlaced] = useState([]);
  useEffect(() => {
    if (!socket) return;
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected");
    });
    socket.on("GAME_EVENTS", (e) => {
      const parsedData = JSON.parse(e);
      setGameEvents((prevEvent) => [...prevEvent, parsedData]);
      setRound(parsedData.round_id);
      setMultipier(parsedData.multiplier);
      setCountDown(parsedData.second);
      if (parsedData.type === "ROUND_END") {
        setRoundEnd((prev) => !prev);
      }
      // console.log(parsedData);
    });
    socket.on("BET_PLACED", (e) => {
      const parsedData = JSON.parse(e);
      setBetPlaced((prev) => [...prev, parsedData]);
      console.log(parsedData);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("GAME_EVENT");
      socket.off("BET_PLACED");
    };
  }, []);
  function placeBet() {
    const betData = {
      user_id: "00000000-0000-0000-0000-000000000061",
      round_id: 123,
      position: 0,
      amount: Number(inputMessage),
    };
    socket.emit("BET", betData);
  }
  return (
    <div className="main">
      <div className="game">
        {/* <ul> */}
        {/* {gameEvents.map((event, index) => (
          <li key={index}>
            Round: {event.round_id} | Multiplier: {event.multiplier}
          </li>
        ))} */}
        {/* Round : {round} */}
        {/* <br /> */}
        {/* Multiplier : {multiplier} */}
        {/* </ul> */}
        {countdown ? (
          <h1>round starts in {countdown}</h1>
        ) : (
          // <h1 style={{ color: roundEnd ? "red" : "black" }}>
          <h1>
            {multiplier}
            {multiplier ? "x" : ""}
          </h1>
        )}
      </div>
      <div className="bet_cont">
        <input
          onChange={(e) => setInputMessage(e.target.value)}
          type="number"
        />
        <button onClick={placeBet}>bet</button>
      </div>
      {betPlaced && (
        <div className="bet_placed">
          {betPlaced.map((bet, i) => (
            <ul key={i}>
              <li>
                User: {bet.user_id} | Amount: {bet.amount} | Position:{" "}
                {bet.position}
              </li>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
}
