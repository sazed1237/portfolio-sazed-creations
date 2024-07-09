import { useState } from 'react'
import Header from './components/Header'
import { Outlet } from "react-router-dom";
import PageTransition from './components/PageTransition';
import StairTransition from './components/StairTransition';
import Footer from './components/Footer';

function App() {

  return (
    <main>
      <Header></Header>
      <StairTransition></StairTransition>
      <PageTransition>
        <Outlet></Outlet>
      </PageTransition>
      <Footer></Footer>
    </main>
  )
}

export default App
