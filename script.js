// Set the dimensions and margins of the diagram
const margin = {top: 170, right: 300, bottom: 200, left: 200};
const width = 3500 - margin.left - margin.right;  // Adjust width
const height = 3500 - margin.top - margin.bottom;  // Adjust height

// Define color map for 1-digit level categories
const colorMap = {
    "0 - Armed forces occupations": "black",
    "1 - Managers": "orange",
    "2 - Professionals": "blue",
    "3 - Technicians and associate professionals": "green",
    "4 - Clerical support workers": "purple",
    "5 - Service and sales workers": "pink",
    "6 - Skilled agricultural, forestry and fishery workers": "brown",
    "7 - Craft and related trades workers": "teal",  // Changed from yellow
    "8 - Plant and machine operators, and assemblers": "red",
    "9 - Elementary occupations": "grey"
};


// Append the svg object to the div called 'tree-container'
const svg = d3.select("#tree-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${(width / 2) + margin.left},${(height / 2) + margin.top})`);

// Create the radial tree layout with more spacing
const tree = d3.tree()
    .size([2 * Math.PI, Math.min(width, height) / 2 - 150]);  // Adjust size to spread out nodes

// Load the JSON data
d3.json("output_data.json").then(data => {
    // Convert the data to a hierarchy
    const root = d3.hierarchy(data);

    // Assigns the x and y position for the nodes
    tree(root);

// Create links between nodes and apply color based on the top-level (1-digit) category
const link = svg.append("g")
  .selectAll("path")
  .data(root.links())
  .enter()
  .append("path")
  .attr("class", "link")
  .attr("stroke", d => {
    // Try accessing the direct top-level from the source's ancestors
    const topLevel = d.source.ancestors().filter(d => d.depth === 1)[0]?.data?.name;

    // Log the top-level category to debug
    console.log("Top Level (1-digit category):", topLevel);

    return colorMap[topLevel] || "grey";  // Apply color based on 1-digit level or default to grey
  })
  .attr("fill", "none")
  .attr("stroke-width", 2)
  .attr("d", d3.linkRadial()
    .angle(d => d.x)
    .radius(d => d.y)
  );




    // Create nodes
    const node = svg.append("g")
        .selectAll("g")
        .data(root.descendants())
        .enter()
        .append("g")
        .attr("transform", d => `
            rotate(${d.x * 180 / Math.PI - 90})
            translate(${d.y},0)
        `);

// Add circles to the nodes, applying color based on the top-level (1-digit) category
node.append("circle")
  .attr("r", 5)
  .attr("fill", d => {
    const topLevel = d.ancestors().slice(-2, -1)[0]?.data?.name;  // Get 1-digit level name
    return colorMap[topLevel] || "grey";  // Apply color based on 1-digit level or default to grey
  });

// Add labels to the nodes
node.append("text")
  .attr("dy", "0.31em")
  .attr("x", d => d.x < Math.PI === !d.children ? 8 : -8)
  .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
  .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
  .style("font-size", "10px")
  .text(d => d.data.name)
  .clone(true).lower()
  .attr("stroke", "white");

}).catch(error => {
    console.error("Error loading the data:", error);
});
