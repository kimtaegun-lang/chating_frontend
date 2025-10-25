import React from 'react';
import { searchOptions } from "..";
import '../../css/Search.css';

const SearchComponent = ({ 
  searchOption, 
  setSearchOptions, 
  onSearchClick 
}: { 
  searchOption: searchOptions;
  setSearchOptions: React.Dispatch<React.SetStateAction<searchOptions>>;
  onSearchClick: () => void;
}) => {
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearchClick();
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        value={searchOption.search}
        onChange={(e) => setSearchOptions({
          ...searchOption,
          search: e.target.value
        })}
        placeholder="검색어를 입력하세요"
        className="search-input"
      />

      <select
        value={searchOption.searchType}
        onChange={(e) => setSearchOptions({
          ...searchOption,
          searchType: e.target.value
        })}
        className="search-select"
      >
        <option value="">전체</option>
        <option value="name">이름</option>
        <option value="email">이메일</option>
        <option value="memId">아이디</option>
      </select>

      <select
        value={searchOption.sort}
        onChange={(e) => setSearchOptions({
          ...searchOption,
          sort: e.target.value
        })}
        className="search-select"
      >
        <option value="">전체</option>
        <option value="createdAt">가입일</option>
      </select>

      <select
        value={searchOption.sortType}
        onChange={(e) => setSearchOptions({
          ...searchOption,
          sortType: e.target.value
        })}
        className="search-select"
      >
        <option value="desc">내림차순</option>
        <option value="asc">오름차순</option>
      </select>

      <button type="submit" className="search-button">
        검색
      </button>
    </form>
  );
};

export default SearchComponent;