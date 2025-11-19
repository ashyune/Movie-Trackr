import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import MyList from "./pages/MyList";
import Friends from './pages/friends';
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/Navbar";
import Discussions from "./pages/Discussions"; // <-- Added
import StartDiscussion from "./pages/StartDiscussion";
import Reminders from './pages/Reminders.jsx';



function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/my-list" element={<MyList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/discussion" element={<Discussions/>} />
        <Route path="/start-discussion" element={<StartDiscussion />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/Reminders" element={<Reminders />} />
         

      </Routes>
    </>
  );
}

export default App;
