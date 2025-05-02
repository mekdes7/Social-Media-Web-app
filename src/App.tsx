import { Route, Routes } from 'react-router-dom';

import { Home } from './pages/Home';
import { NavBar } from './components/NavBar';
import { CreatePost } from './pages/CreatePost';
import { PostPage } from './pages/PostPage';
import { CreateCommunityPage } from './pages/CreateCommunityPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { CommunityPage } from './pages/CommunityPage';
import { UpdatePostPage } from './pages/UpdatePostPage';
import { DeletePostPage } from './pages/DeletePostPage';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>  
      <div className='min-h-screen bg-black text-gray-100 transition-opacity duration-700 pt-20'>
        <NavBar />
        
        <div>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/create' element={<CreatePost />} />
            <Route path='/posts/:id' element={<PostPage />} /> 
            <Route path='/community/create' element={<CreateCommunityPage />} />
            <Route path='/communities' element={<CommunitiesPage />} />
            <Route path='/community/:id' element={<CommunityPage />} />
            <Route path='/posts/update/:id' element={<UpdatePostPage />} />
            <Route path='/posts/delete/:id' element={<DeletePostPage />} />
            <Route path='*' element={<div className='text-center text-red-500'>404 Not Found</div>} />
          </Routes>
        </div>
      </div>
    </ThemeProvider>  
  );
}

export default App;
