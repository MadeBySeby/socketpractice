import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
export default function App() {
  // const [socket, setSocket] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [inputMessage, setInputMessage] = useState("");
  const [currentBet, setCurrentBet] = useState();
  const [gameEvents, setGameEvents] = useState([]);
  const [round, setRound] = useState(gameEvents?.map((e) => e.round_id));
  const [multiplier, setMultipier] = useState();
  const [countdown, setCountDown] = useState();
  // const [roundEnd, setRoundEnd] = useState();
  const [betPlaced, setBetPlaced] = useState([]);
  const params = useParams();
  const [currentUser, setCurrentUser] = useState(
    () => searchParams.get("user") || null
  );
  const [currentUserBalance, setCurrentUserBalance] = useState(0);
  const [userToDisplay, setUserToDisplay] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (!socket) return;
    const fetchData = async () => {
      try {
        const resp = await fetch("/api/user");
        const data = await resp.json();

        setUsers(data);
        // console.log("User data:", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
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
      // if (parsedData.type === "ROUND_END") {
      //   setRoundEnd(parsedData.round_id);
      // }
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
      socket.off("GAME_EVENTS");
      socket.off("BET_PLACED");
    };
  }, []);
  function placeBet() {
    const amount = Number(inputMessage);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }
    setUserBalance((prev) => prev - amount);
    const betData = {
      user_id: currentUser,
      round_id: round,
      position: 0,
      amount: Number(inputMessage),
    };
    console.log("Bet data:", betData);
    socket.emit("BET", betData);
  }
  useEffect(() => {
    if (!currentUser || users.length === 0) return;

    const fetchBalance = async () => {
      try {
        const API_BASE = import.meta.env.PROD ? "https://mw.artwear.ge" : "";

        const resp = await fetch(`${API_BASE}/api/user`);
        const balances = await resp.json();
        const userBalance = balances.find((b) => b.userId === currentUser);
        console.log(userBalance);
        if (userBalance) {
          setCurrentUserBalance(userBalance.totalBalance);
          setSearchParams({
            user: currentUser,
            balance: userBalance.totalBalance,
          });
        }
      } catch (err) {
        console.error("Balance fetch error:", err);
      }
    };

    fetchBalance();
  }, [currentUser, users, setSearchParams]);

  useEffect(() => {
    setUserToDisplay(searchParams.get("user"));
    setUserBalance(searchParams.get("balance"));
  }, [searchParams]);
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
        <select
          value={currentUser || ""}
          onChange={(e) => setCurrentUser(e.target.value)}>
          {users.map((user) => {
            return (
              <option key={user.id} value={user.id}>
                user:{user.id}
              </option>
            );
          })}
        </select>
        {currentUserBalance ? `your balance ${currentUserBalance}` : ""}
      </div>
      {console.log(betPlaced)}
      {betPlaced && (
        <div className="bet_placed">
          {`current user : ${userToDisplay} | balance: ${userBalance}`}

          {betPlaced.map((bet, i) => (
            <ul key={i}>
              <h1>last bet</h1>
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
