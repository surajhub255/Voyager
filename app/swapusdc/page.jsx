"use client"
import WormholeConnect from '@wormhole-foundation/wormhole-connect';
import Navbar from '../components/reusable/HomeNavbar';
const DemoNav = () => {
  return (
    <div>
    <Navbar/>
    {/* <WormholeConnect config={{"env":"devnet"}} /> */}
    <WormholeConnect />
    </div>

  );
}
export default DemoNav;