// StarMapPage.tsx

// Update background color and star properties
const canvasStyle = {
  backgroundColor: 'rgba(40, 50, 80, 1)', // Updated background color
};

const stars = generateStars(100); // Increased the number of stars

function generateStars(count) {
  const starsArray = [];
  for (let i = 0; i < count; i++) {
    starsArray.push({
      opacity: Math.random(), // Increased random opacity for stars
    });
  }
  return starsArray;
}

// rest of your component code...