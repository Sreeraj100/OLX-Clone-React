import React, { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import Login from './Components/Modal/Login'
import Sell from './Components/Modal/Sell'
import { Outlet } from 'react-router-dom'
import { ItemsContext } from './Context/Item'

const Layout = () => {
  const [openModal, setModal] = useState(false)
  const [openModalSell, setModalSell] = useState(false)
 
  const itemsCtx = ItemsContext()

  const toggleModal = () => setModal(!openModal)
  const toggleModalSell = () => setModalSell(!openModalSell)
 

  return (
    <>
      <Navbar
        toggleModal={toggleModal}
        toggleModalSell={toggleModalSell}
        
      />

      <Login toggleModal={toggleModal} status={openModal} />
      <Sell setItems={itemsCtx.setItems} toggleModalSell={toggleModalSell} status={openModalSell} />

      <div className="px-4">
        <Outlet />
      </div>
    </>
  )
}

export default Layout
