import store from '@/redux/store';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const Profile = () => {
  const dispach=useDispatch();
  const {user}=useSelector(store=>store.auth);
  const [loading ,setLoading]=useState(false);
  const [open,setOpen]=useState(false);
  const [input,setInput]=useState({
    name:''
  })


  const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({
            ...prev,
            [name]: value,
        }))
    }
    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] })
    }

    
  return (
    <div>Profile</div>
  )
}

export default Profile