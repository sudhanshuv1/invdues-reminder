import Header from './Header';
import Footer from './Footer';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRefreshQuery } from '../features/apiSlice';
import { setCredentials } from '../features/authSlice';
import { Outlet } from 'react-router-dom';

const Wrapper = () => {

  const dispatch = useDispatch();
  const { data, isSuccess } = useRefreshQuery(undefined, { skip: false });

  useEffect(() => {
    if (isSuccess && data?.accessToken) {
      dispatch(setCredentials({
        user: JSON.parse(localStorage.getItem('user')),
        accessToken: data.accessToken,
      }));
      localStorage.setItem('accessToken', data.accessToken);
    }
  }, [isSuccess, data, dispatch]);

    return (
        <>
            <Header />
            <Outlet />
            <Footer />
        </>
    )
}

export default Wrapper;

