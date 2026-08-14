import { Routes, Route } from "react-router-dom";
import { Shell } from "./components/Shell";
import { CreateTrade } from "./pages/CreateTrade";
import { OpenTrades } from "./pages/OpenTrades";
import { MyTrades } from "./pages/MyTrades";
import { TradeDetail } from "./pages/TradeDetail";
import { HowItWorks } from "./pages/HowItWorks";
export function App(){return <Routes><Route element={<Shell/>}><Route index element={<CreateTrade/>}/><Route path="open" element={<OpenTrades/>}/><Route path="my-trades" element={<MyTrades/>}/><Route path="settlement/:id" element={<TradeDetail/>}/><Route path="how-it-works" element={<HowItWorks/>}/></Route></Routes>}
