import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
export default function App() {
  // const [socket, setSocket] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [betAmount, setBetAmount] = useState();
  const [currentBet, setCurrentBet] = useState();
  const [gameEvents, setGameEvents] = useState([]);
  const [round, setRound] = useState(gameEvents?.map((e) => e.round_id));
  const [roundStarted, setRoundStarted] = useState(false);
  const [multiplier, setMultipier] = useState();
  const [countdown, setCountDown] = useState(true);
  const [isBetPlaced, setIsBetPlaced] = useState(false);
  const [cashoutPlaced, setCashoutPlaced] = useState([]);
  // const [roundEnd, setRoundEnd] = useState();
  const [betPlaced, setBetPlaced] = useState([]);
  const params = useParams();
  const [currentUser, setCurrentUser] = useState(
    () => searchParams.get("user") || null
  );
  const [currentUserBalance, setCurrentUserBalance] = useState(0);
  const [userToDisplay, setUserToDisplay] = useState(null);
  const [userBalance, setUserBalance] = useState(
    () => searchParams.get("balance") || 0
  );
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
    const handleConnect = () => {
      console.log("✅ Connected:", socket.id);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Disconnected");
    };

    const handleGameEvents = (e) => {
      const parsedData = JSON.parse(e);
      setGameEvents((prevEvent) => [...prevEvent, parsedData]);
      setRound(parsedData.round_id);
      setMultipier(parsedData.multiplier);
      setCountDown(parsedData.second);

      if (parsedData.type === "ROUND_END") {
        setIsBetPlaced(false);
      }
    };

    const handleBetPlaced = (e) => {
      const parsedData = JSON.parse(e);
      setBetPlaced((prev) => [...prev, parsedData]);
    };

    const handleCashoutPlaced = (e) => {
      console.log("Raw cashout data:", e);
      try {
        const parsedData = JSON.parse(e);
        setCashoutPlaced((prev) => [...prev, parsedData]);
        if (parsedData.user_id === currentUser) {
          setUserBalance(
            (prev) => Number(prev) + Number(parsedData.amount || 0)
          );
        }
      } catch (error) {
        console.error("Error parsing CASHOUT_PLACED data:", error);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("GAME_EVENTS", handleGameEvents);
    socket.on("BET_PLACED", handleBetPlaced);
    socket.on("CASHOUT_PLACED", handleCashoutPlaced);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("GAME_EVENTS", handleGameEvents);
      socket.off("BET_PLACED", handleBetPlaced);
      socket.off("CASHOUT_PLACED", handleCashoutPlaced);
    };
  }, [currentUser]);
  function placeBet() {
    const amount = Number(betAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }
    // setSearchParams({
    //   user: currentUser,
    //   balance: userBalance - amount,
    // });
    if (!currentUser || !round) {
      alert("Missing user or round ID.");
      console.error("placeBet() → missing:", { currentUser, round });
      return;
    }
    const betData = {
      user_id: currentUser,
      round_id: round,
      position: 0,
      amount: amount,
    };
    // console.log("Bet data:", betData);

    socket.emit("BET", betData);
    setUserBalance((prev) => prev - amount);
  }
  function cashout() {
    if (!currentUser || !round) return alert("Missing user or round ID.");
    const cashoutData = {
      user_id: currentUser,
      round_id: round,
      position: 0,
      amount: currentBet?.amount || Number(betAmount) || 0,
    };
    console.log("Attempting CASHOUT with:", cashoutData);
    socket.emit("CASHOUT", cashoutData);
  }
  useEffect(() => {
    if (!currentUser || users.length === 0) return;

    const fetchBalance = async () => {
      try {
        const resp = await fetch("/api/user/balance");
        const balances = await resp.json();
        const userBalance = balances.find((b) => b.userId === currentUser);
        // console.log(userBalance);
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
  const [isDisabled, setIsDisabled] = useState(false);
  function handleBetPlaced() {
    setIsBetPlaced((prev) => !prev);

    placeBet();
  }
  console.log(isBetPlaced);
  useEffect(() => {
    setUserToDisplay(searchParams.get("user"));
    setUserBalance(searchParams.get("balance"));
  }, [searchParams]);
  console.log(cashoutPlaced);
  return (
    <>
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
          <input onChange={(e) => setBetAmount(e.target.value)} type="number" />
          <button
            disabled={isBetPlaced || !countdown ? true : false}
            onClick={handleBetPlaced}>
            {isBetPlaced ? "cancel" : "Place Bet"}
            {/* cancel ჯერ არ დამიმატებია */}
          </button>
          {/* {currentUserBalance ? `your balance ${currentUserBalance}` : ""} */}
        </div>
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
        {betPlaced.length > 0 && (
          <div className="bet_placed">
            <h2>Bet History</h2>
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
        {userToDisplay && (
          <div>
            current user : {userToDisplay} | balance: {userBalance}
            <button onClick={cashout}>Cash out</button>
            {cashoutPlaced.length > 0 && (
              <div>
                <h2>Cashout History:</h2>
                {cashoutPlaced.map((cashout, i) => (
                  <ul key={i}>
                    <li>
                      User: {cashout.user_id} | Amount: {cashout.amount} |
                      Position: {cashout.position}
                    </li>
                  </ul>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
