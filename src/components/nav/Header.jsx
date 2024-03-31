import { HomeTwoTone, EditTwoTone, CheckCircleTwoTone } from '@ant-design/icons';
import { Menu } from 'antd';
import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';


const Header = () => {
  const [current, setCurrent] = useState('h');
  const onClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };
  return (
    <>
     <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal">
      <Menu.Item key="h" icon= {<HomeTwoTone />}>
       <Link to="/">Home</Link>
      </Menu.Item>
      <Menu.Item key="l" icon= {<CheckCircleTwoTone />} >
        <Link to="/login">Login</Link>
      </Menu.Item>
      <Menu.Item key="g" icon= {<CheckCircleTwoTone />} >
        <Link to="/gallery">Gallery</Link>
      </Menu.Item>
     </Menu>
    </>
   
  )
};
export default Header;