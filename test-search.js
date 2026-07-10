const testSearch = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/books/search?title=Putih Abu-Abu');
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testSearch();