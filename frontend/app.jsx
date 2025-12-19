import { useState, useEffect } from "react";
import axios from "axios";

const API = "https://wallet-project.onrender.com"; // Vendos link backend live

export default function App() {
  const [user,setUser] = useState(null);
  const [notification,setNotification] = useState("");
  const [displayBalance,setDisplayBalance] = useState(0);

  const REFERRAL_CODE = "ABC123"; // <-- vendos referral code tënd

  // Animate balance
  useEffect(()=>{
    if(user){
      let start = displayBalance;
      let end = user.balance;
      if(start === end) return;
      let increment = (end - start) / 20;
      const interval = setInterval(()=>{
        start += increment;
        if(start >= end) start=end;
        setDisplayBalance(Math.floor(start));
        if(start === end) clearInterval(interval);
      },50);
    }
  },[user?.balance]);

  const showNotification = (msg)=>{
    setNotification(msg);
    setTimeout(()=>setNotification(""),2000);
  };

  // 1-click register + login
  const oneClickRegister = async () => {
    const email = `user${Math.floor(Math.random()*10000)}@mail.com`;
    const password = "123456";
    try{
      // register
      await axios.post(`${API}/register`,{ email, password, referral: REFERRAL_CODE });
      showNotification(`🎉 Referral bonus +2€!`);
      // login
      const res = await axios.post(`${API}/login`,{ email, password });
      setUser(res.data);
    } catch(err){
      alert(err.response?.data || "Error");
    }
  };

  const doTask = async (taskName)=>{
    const res = await axios.post(`${API}/do-task`, { email: user.email, taskName });
    setUser(res.data);
    showNotification(`+${res.data.reward}€ for ${taskName}`);
  };

  if(!user) return (
    <div style={styles.container}>
      <h1>💰 Wallet App SUPER PRO + Referral Anim</h1>
      <button style={styles.button} onClick={oneClickRegister}>🚀 1-Click Start with Referral</button>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1>💸 Dashboard SUPER PRO</h1>

      {notification && <div style={styles.notification}>{notification}</div>}

      <h2>Balance: {displayBalance}€</h2>
      <h3>Package: {user.package}</h3>
      <h4>Tasks Done: {user.tasksDone}</h4>
      <h4>Your Referral Code: {user.referralCode}</h4>

      <div style={{marginTop:20}}>
        <h4>Do Tasks</h4>
        {[1,2,3,4,5].map(i=>(
          <button key={i} style={styles.taskButton} onClick={()=>doTask(`Task ${i}`)}>Task {i}</button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container:{textAlign:"center", marginTop:50, fontFamily:"Arial", padding:"0 10px"},
  button:{padding:15, fontSize:16, cursor:"pointer", backgroundColor:"#27ae60", color:"#fff", border:"none", borderRadius:8},
  taskButton:{margin:5, padding:10, backgroundColor:"#f39c12", color:"#fff", border:"none", borderRadius:5, cursor:"pointer"},
  notification:{position:"fixed", top:10, right:10, backgroundColor:"#f1c40f", color:"#000", padding:"10px 20px", borderRadius:5, boxShadow:"0 2px 5px rgba(0,0,0,0.3)", fontWeight:"bold", zIndex:999, transition:"all 0.3s ease"}
};
