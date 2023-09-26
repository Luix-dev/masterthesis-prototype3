import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { ApiResponse as BaseApiResponse } from './index';

interface ApiResponse extends BaseApiResponse {
  x?: number;
  y?: number;
  active?: boolean;
}

interface Props {
  data: ApiResponse[];
  filters: { [key: string]: any[] };
}

interface Link {
  source: ApiResponse;
  target: ApiResponse;
}

const D3Visualization: React.FC<Props> = ({ data, filters }) => {
  useEffect(() => {
    const svg = d3.select('#svg-container');
    if (svg.empty()) {
      console.error('SVG not found!');
      return;
    }

    const width = 800;
    const height = 500;
    svg.attr('width', width).attr('height', height);
    svg.selectAll("*").remove();
    const group = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const filteredData = data.filter(d => {
      return Object.entries(filters).every(([key, values]) => {
        if (values.length === 0) return true;
        const attributes = (d as any)[key] as any[]; // Casting to any to avoid TypeScript error
        return values.some(value => attributes.map(attr => attr.text || attr).includes(value));
      });
    });

    const links: Link[] = [];
    filteredData.forEach((sourceNode, sourceIndex) => {
      filteredData.forEach((targetNode, targetIndex) => {
        if (sourceIndex >= targetIndex) return;
        const commonAttributes: string[] = [];
        ['named_entities', 'topics', 'keywords'].forEach(attr => {
          const sourceAttrs = (sourceNode as any)[attr] || []; // Casting to any to avoid TypeScript error
          const targetAttrs = (targetNode as any)[attr] || []; // Casting to any to avoid TypeScript error
          sourceAttrs.forEach((sourceAttr: any) => {
            targetAttrs.forEach((targetAttr: any) => {
              if (sourceAttr.text === targetAttr.text) {
                commonAttributes.push(sourceAttr.text);
              }
            });
          });
        });
        if (commonAttributes.length > 0) {
          links.push({ source: sourceNode, target: targetNode });
        }
      });
    });

    const drag = d3.drag<SVGCircleElement, ApiResponse>()
      .on('start', (event, d) => {
        if (!event.active) group.call(d3.drag as any);
        d.active = true;
      })
      .on('drag', (event, d) => {
        d.x = event.x;
        d.y = event.y;
        render();
      })
      .on('end', (event, d) => {
        if (!event.active) group.call(d3.drag as any);
        d.active = false;
      });

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '1px')
      .style('border-radius', '5px')
      .style('padding', '10px');

    const render = () => {
      const circles = group.selectAll('circle')
        .data(filteredData)
        .join('circle')
        .attr('r', 20)
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0)
        .attr('fill', 'steelblue');

      circles.call(drag as any);

      group.selectAll('text')
        .data(filteredData)
        .join('text')
        .attr('x', d => d.x || 0)
        .attr('y', d => (d.y || 0) - 25)
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .text(d => d.title);

      group.selectAll('line')
        .data(links)
        .join('line')
        .attr('x1', d => d.source.x || 0)
        .attr('y1', d => d.source.y || 0)
        .attr('x2', d => d.target.x || 0)
        .attr('y2', d => d.target.y || 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 3)
        .on('click', function (event, d) {
          const commonAttributes = getCommonAttributes(d.source, d.target).filter(Boolean);
          if (tooltip.style('opacity') === '0') {
            tooltip.transition()
              .duration(200)
              .style('opacity', .9);
            tooltip.html(commonAttributes.join(', '))
              .style('left', (event.pageX) + 'px')
              .style('top', (event.pageY - 28) + 'px');
          } else {
            tooltip.transition()
              .duration(500)
              .style('opacity', 0);
          }
        });
    };

    render();
    return () => {
      tooltip.remove();
    };
  }, [data, filters]);

  function getCommonAttributes(sourceNode: ApiResponse, targetNode: ApiResponse): string[] {
    const commonAttributes: string[] = [];
    ['named_entities', 'topics', 'keywords'].forEach(attr => {
      const sourceAttrs = sourceNode[attr as keyof ApiResponse] || [];
      const targetAttrs = targetNode[attr as keyof ApiResponse] || [];
      (sourceAttrs as any[]).forEach(sourceAttr => {
        (targetAttrs as any[]).forEach(targetAttr => {
          if (sourceAttr.text === targetAttr.text) {
            commonAttributes.push(sourceAttr.text);
          }
        });
      });
    });
    return commonAttributes;
  }

  return (
    <svg id="svg-container"></svg>
  );
};

export default D3Visualization;
