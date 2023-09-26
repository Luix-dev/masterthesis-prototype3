// pages/Visualizations.tsx
'use client';
import * as d3 from 'd3';
import React, { useEffect, useRef } from 'react';
import { ApiResponse } from './index'; // Import the correct type

interface VisualizationProps {
  data: ApiResponse[]; // Use the correct type
}

const Visualization: React.FC<VisualizationProps> = ({ data }) => {
  const ref = useRef(null); // Reference to the div to attach our svg to

  useEffect(() => {
    if (!data || data.length === 0) return; // If there is no data, we don't want to create the visualization

    const svg = d3.select(ref.current) // Select our ref
      .append('svg') // Append an svg element to our ref
      .attr('width', 400) // Give it a width of 400
      .attr('height', 200); // Give it a height of 200

    svg.selectAll('circle') // Select all circles in our svg
      .data(data) // Bind the data to the circles
      .enter() // For each piece of data, enter...
      .append('circle') // Append a circle
      .attr('cx', (d, i) => i * 50 + 25) // Position each circle horizontally, spaced 50px apart
      .attr('cy', 100) // Position each circle vertically in the middle of the svg
      .attr('r', 20) // Give each circle a radius of 20
      .attr('fill', 'blue'); // Fill each circle with a blue color

  }, [data]); // Re-run the effect when the data changes

  return <div ref={ref}></div>; // Return our div with the ref attached
};

export default Visualization;
