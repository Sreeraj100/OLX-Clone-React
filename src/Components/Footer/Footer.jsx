
import { UserAuth } from '../../Context/Auth'
const Footer = () => {
  const {user} = UserAuth()

  return (
    <div>
        <div className="flex justify-between justify-items-center bg-cyan-900 p-8 ">
            <img src="https://statics.olx.in/external/base/img/cartrade/logo/olx_2025.svg?v=1" alt="olx" className='w-24 h-24'/>
            <img src="https://statics.olx.in/external/base/img/cartrade/logo/carwale.svg?v=1" alt="carwale" className='w-36 h-24'/>
            <img src="https://statics.olx.in/external/base/img/cartrade/logo/bikewale.svg?v=1" alt="bikewale" className='w-36 h-24'/>
            <img src="https://statics.olx.in/external/base/img/cartrade/logo/cartrade.svg?v=1" alt="cartrade" className='w-36 h-24'/>
            <img src="https://statics.olx.in/external/base/img/cartrade/logo/mobility.svg?v=1" alt="Mobility" className='w-36 h-24'/>
        </div>
        <div className="flex justify-between justify-items-center bg-cyan-900 pl-24 pr-24 pb-8">
        <p className='text-white'>Help site-map</p>
        <p>{user && `user:${user.displayName}`}</p>
        <p className='text-white'>All rights reserved © 2006-2025 OLX</p>
        </div>
    </div>
  )
}

export default Footer;