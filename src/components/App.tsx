import React, { FC, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { makeServer } from './server';
import { Post } from './types';

const categories: string[] = [
  // Categories list for filter purpose
  "Data Management",
  "Digital Marketing",
  "Ecommerce",
  "Email Marketing",
  "Landing Pages",
  "Marketing Analytics",
  "Marketing Automation",
  "Platform News and Updates",
  "Surveys and Forms",
  "Tips and Best Practise"
];

interface FilterPanelProps {
  selectedCategories: string[];
  onCategoryChange: (category: string) => void;
}

const FilterPanel: FC<FilterPanelProps> = ({ selectedCategories, onCategoryChange }) => {
  return (
    <div className="filter-panel">
      <h2>Filter Options</h2>
      <div className="checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={selectedCategories.includes("All")}
            onChange={() => onCategoryChange("All")}
          />
          All
        </label>
        {categories.map(category => (
          <label key={category}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => onCategoryChange(category)}
            />
            {category}
          </label>
        ))}
      </div>
    </div>
  );
};

makeServer();

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFilterPanelVisible, setIsFilterPanelVisible] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["All", ...categories]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  const [postsToShow, setPostsToShow] = useState(12);

  useEffect(() => {
    // Getting data from the server
    const fetchData = async () => {
      try {
        const response = await axios.get<{ posts: Post[] }>('/api/data');
        const fetchedPosts = response.data.posts;
        const sortedPosts = sortPostsByTitle(fetchedPosts);
        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
        setVisiblePosts(sortedPosts.slice(0, postsToShow));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Update the data for diplaying
    filterPosts();
  }, [selectedCategories, posts, searchTerm]);

  useEffect(() => {
    // Set Posts that is visible
    setVisiblePosts(filteredPosts.slice(0, postsToShow));
  }, [filteredPosts, postsToShow]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Set searching words
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (category: string) => {
    // Cateogory filter
    let newSelectedCategories:any;

    if (category === "All") {
      // Return all if All is selected
      if (selectedCategories.includes("All")) {
        newSelectedCategories = [];
      } else {
        newSelectedCategories = ["All", ...categories];
      } 
    } else {
      // Validate catergory selected
      if (selectedCategories.includes(category)) {
        // Remove category that is not selected
        newSelectedCategories = selectedCategories.filter((item:string) => item !== category);
        if (newSelectedCategories.includes("All")) {
          // All is selected
          newSelectedCategories = newSelectedCategories.filter((item:string) => item!== "All");
        }
      } else {
        newSelectedCategories = [...selectedCategories, category];
        if (newSelectedCategories.length === categories.length) {
          newSelectedCategories = ["All", ...categories];
        }
      }
    }
    setSelectedCategories(newSelectedCategories);
  };

  const filterPosts = () => {
    let newFilteredPosts = posts;
    // Validate categories selected
    if (!(selectedCategories.includes("All") || selectedCategories.length === 0)) {
      newFilteredPosts = newFilteredPosts.filter(post =>
        post.categories.some(category => selectedCategories.includes(category.name))
      );
    }

    // Validate searching term
    if (searchTerm) {
      newFilteredPosts = newFilteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Update post for displaying after validation
    setFilteredPosts(newFilteredPosts);
  };

  // Arrange the post base of title in acending order
  const sortPostsByTitle = (posts: Post[]): Post[] => {
    return posts.sort((a, b) => a.title.localeCompare(b.title));
  };

  // Increase the post display
  const loadMorePosts = () => {
    setPostsToShow(prev => prev + 12);
  };

  // Check any post is able to read
  try{
    if (posts.length === 0) {
      return <div>Loading...</div>;
    }
  }catch{}

  

  return (
    <div className="App">
      {/* Navigation bar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <button 
            className="filter-button" 
            // Showing the panel
            onClick={() => setIsFilterPanelVisible(!isFilterPanelVisible)}
            >
            ☰
            </button>
            <h1>Blog</h1>
          </div>
          <div className="navbar-right">
            <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm} 
            onChange={handleSearchChange} 
            />
          </div>
        </div>
      </nav>
      <div className={`filter-panel ${isFilterPanelVisible ? 'visible' : ''}`}>
        <button 
        className="close-button" 
        // Hiddin the panel
        onClick={() => setIsFilterPanelVisible(false)}
        >
          ✕
        </button>
        <h2>Filter Options</h2>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={selectedCategories.includes("All")}
              onChange={() => handleCategoryChange("All")}
            />
            All
          </label>
          {categories.map(category => (
            <label key={category}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div id="postListing">
        {/* Control for number of posts displaying */}
        {visiblePosts.slice(0, visiblePosts.length).map(post =>(
        // For case to display full article when user want to read the full article
        // <Link>
          <div className = "posting-card">
            <div className='Title'>
              <h1>{post.title}</h1>
            </div>
            <div className='Author'>
              <p><strong>Author:</strong> {post.author.name}</p>
              <img src={post.author.avatar} alt={post.author.name} />
            </div>
            
            <div className='Categories'>
              <h3>Categories:</h3>
              {<ul>
              {post.categories
                // Filter
                .filter((category, index, self) => self.findIndex(c => c.name === category.name) === index)
                .map(category => (
                  <li key={category.id}>{category.name}</li>
                ))}
              </ul>}
              <div id='cardDetail'>
                <div id='Summary'>
                  <p>{post.summary}</p>
                </div>
                <div className='Date'>
                    <p><strong>Published Date:</strong> {new Date(post.publishDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
          </div>
        // </Link>
        ))}
      </div>
      <div id = 'loading'>
        {postsToShow < filteredPosts.length && (
          <button onClick={loadMorePosts} id='loadingButton'>Load More</button>
        )}
      </div>
    </div>
  );
}


export default App;