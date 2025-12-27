import './Navbar.css'
import logo from '../../assets/symbol.png'
import search from '../../assets/search1.svg'
import arrow from '../../assets/arrow-down.svg'
import searchWt from '../../assets/search.svg'
import {useAuthState} from 'react-firebase-hooks/auth'
import { auth } from '../Firebase/Firebase'
import addBtn from '../../assets/addButton.png'
import { useState,useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'




const Navbar = (props) => {
    const [user] = useAuthState(auth)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const userBtnRef = useRef(null)
    const {toggleModal ,toggleModalSell, setSearchItem,searchItem } = props
    const navigate = useNavigate();


    const [localSearchValue, setLocalSearchValue] = useState(searchItem || "")

    useEffect(() => {
        setLocalSearchValue(searchItem || "")
    }, [searchItem])

    const handleSearchChange = (e) => {
        const value = e.target.value
        setLocalSearchValue(value)
        // Debounce the search to avoid too many rerenders
        if (setSearchItem) {
            console.log("Setting search item:", value)
            setSearchItem(value)
        }
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                showDropdown && 
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target) &&
                userBtnRef.current && 
                !userBtnRef.current.contains(event.target)
            ) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [dropdownRef, userBtnRef, showDropdown])

    const handleLogout = () => {
        auth.signOut()
        setShowDropdown(false)
    }

    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
    useEffect(() => {
        if (userBtnRef.current && showDropdown) {
            const rect = userBtnRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                right: window.innerWidth - rect.right
            })
        }
    }, [showDropdown])

    const UserDropdown = () => {
        if (!showDropdown) return null

        return createPortal(
            <div 
                ref={dropdownRef}
                className='fixed bg-white rounded-md shadow-lg py-1 border border-gray-200 w-48'
                style={{ 
                    top: `${dropdownPosition.top}px`, 
                    right: `${dropdownPosition.right}px`, 
                    zIndex: 9999 
                }}
            >
                <div className='px-4 py-2 font-semibold text-gray-700 border-b border-gray-200'>
                    <p className='font-semibold'>{user?.displayName}</p>
                    <p className='text-gray-500 font-semibold text-xs'>{user?.email}</p>
                </div>
                <a href="#" className='block px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100'>My Account</a>
              <button 
    onClick={() => {
        navigate('/myads');
        setShowDropdown(false);
    }}
    className='block w-full text-left px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100'
>
    My Ads
</button>

                <a href="#" className='block px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100'>Favorites</a>
                <button
                    onClick={handleLogout}
                    className='block w-full text-left px-4 py-2 font-semibold text-red-600 hover:bg-gray-100'
                >
                    Logout
                </button>
            </div>,
            document.body
        )
    }
  return (
    <div>
           <nav className="fixed z-50 w-full overflow-auto p-2 pl-3 pr-3 shadow-md bg-slate-100 border-b-4 border-solid border-b-white">
                <img src={logo} alt="" className='w-12 ' />
                <div className='relative location-search  ml-5'>
                    <img src={search} alt="" className='absolute top-4 left-2 w-5' />
                    <input 
                    value={localSearchValue}
                    onChange={handleSearchChange}
                    placeholder='Search city, area, or locality...' 
                    className='w-[50px] sm:w-[150px] md:w-[250] lg:w-[270px] p-3 pl-8 pr-8 border-black border-solid border-2 rounded-md placeholder:text-ellipsis focus:outline-none focus:border-teal-300' type="text" />
                    <img  src={arrow} alt="" className='absolute top-4 right-3 w-5 cursor-pointer' />
                </div>

                <div className="ml-5 mr-2 relative w-full main-search">
                    <input placeholder='Find Cars, Mobile Phones, and More...' className='w-full p-3 border-black border-solid border-2 rounded-md placeholder:text-ellipsis focus:outline-none focus:border-teal-300' type="text" />
                    <div style={{ backgroundColor: '#002f34' }} className="flex justify-center items-center absolute top-0 right-0 h-full rounded-e-md w-12">
                        <img className="w-5 filter invert" src={searchWt} alt="Search Icon" />
                    </div>
                </div>

                <div className="mx-1 sm:ml-5 sm:mr-5 relative lang">
                    <p className="font-bold mr-3" >English</p>
                    <img src={arrow} alt="" className='w-5 cursor-pointer' />
                </div>

                {!user ? (
                    <p onClick={toggleModal} className='font-bold underline ml-5 cursor-pointer' style={{color: '#002f34'}}>Login</p>
                ) : (
                    <div ref={userBtnRef} className='relative'>
                        <div
                            onClick={() => setShowDropdown(!showDropdown)}
                            className='flex items-center cursor-pointer'
                        >
                            <p style={{ color: '#002f34' }} className='font-bold ml-5'>{user.displayName?.split(' ')[0]}</p>
                            <img 
                                src={arrow} 
                                alt="" 
                                className={`w-4 ml-1 transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`} 
                            />
                        </div>
                        <UserDropdown />
                    </div>
                )}

              <img src={addBtn} 
              onClick={ user ? toggleModalSell : toggleModal}
               className='w-24 mx-1 sm:ml-5 sm:mr-5 shadow-xl rounded-full cursor-pointer'
                alt="" />
            </nav>

            <div className='w-full relative z-0 flex shadow-md p-2 pt-20 pl-10 pr-10 sm:pl-44 md:pr-44 sub-lists'>
                <ul className='list-none flex items-center justify-between w-full'>
                    <div  className='flex flex-shrink-0'>
                        <p  className='font-semibold uppercase all-cats'> All categories</p>
                        <img className='w-4 ml-2' src={arrow} alt="" />

                    </div>

                    <li>Cars</li>
                    <li>Motorcycles</li>
                    <li>Mobile Phones</li>
                    <li>For sale : Houses & Apartments</li>
                    <li>Scooter</li>
                    <li>Commercial & Other Vehicles</li>
                    <li>For rent : Houses & Apartments</li>

                </ul>

            </div>


          
    </div>
  )
}
Navbar.propTypes = {
    toggleModal: PropTypes.func,
    toggleModalSell: PropTypes.func,
    setSearchItem: PropTypes.func,
    searchItem: PropTypes.string
}

export default Navbar;
