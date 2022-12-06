import * as d3 from 'd3';
import cod from './cod.csv?raw';
import inf_mort_life_expt_cont3 from './inf_mort_life_expt_cont3.csv?raw';
import inf_mort_hdi_cont4 from './inf_mort_hdi_cont4.csv?raw'


function graph1(){
  const HEIGHT = 600;
  const WIDTH = 800;
  const PADDING = 60;

  const codParsed = d3.csvParse(cod);
  console.log(codParsed);

  const buckets = Object.keys(codParsed[0]).filter( buk => buk !== "Year" );
  // const buckets = Object.keys(codParsed[0]).filter( buk => buk !== "Year" || "Neonatal encephalopathy due to birth asphyxia and trauma");
  console.log(buckets);

  let diseaseMapping = {
    "Congenital birth defects": "CBD",
    "Diarrhea": "D",
    "Lower respiratory infections": "LRI",
    "Neonatal encephalopathy due to birth asphyxia and trauma": "NEDTBAT",
    "Neonatal preterm birth": "NPB",
    "others": "O"
  };


  const totalPerYear = codParsed.reduce((prev, curr) => {
    let sum = 0;
    buckets.forEach((buk) => {
      sum += parseInt(curr[buk]);
    });
    prev.push(sum);
    return prev;
  }, []);

  const maxTotalPerYear = Math.max(...totalPerYear);


  const yScale = d3.scaleBand()
    .domain(codParsed.reduce((prev , curr) => {
      prev.push(curr.Year)
      return prev;
    }, []))
    .range([PADDING, HEIGHT-PADDING])
    .paddingInner(0.4);

  const xScale = d3.scaleLinear()
    .domain([0, maxTotalPerYear])
    .range([PADDING, WIDTH-PADDING]);

  // const colors = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF'];
  // const colors = [ '#A0C4FF' ,'#9BF6FF', '#f3de2c', '#1f7a8c', '#433e3f','#db5461'];
  // const colors = [ '#ef476f' ,'#ffd166', '#06d6a0', '#118ab2', '#ff7d00','#c32f27'];
  const colors = [ '#abc4ff' ,'#FFD053', '#F7A4BC', '#A1D7D7', '#D7D775','#e0aaff'];
  // const colors = [ '#C1292E' ,'#F1D302', '#698F3F', '#7798AB', '#22223B','#78290f'];
  // const colors = ['#eae4e9', '#fff1e6', '#fde2e4', '#ef798a', '#e2ece9', '#cddafd'];
  const colorMap = d3.scaleOrdinal()
    .domain(buckets)
    .range(colors);

  const stackData = d3.stack().keys(buckets)(codParsed);
  console.log(stackData);

  const svgMain = d3.select('#svg1')
    .attr('height', HEIGHT)
    // .attr('style', 'border: 1.5px solid silver')
    .attr('width', WIDTH);

  const svg = svgMain.select('.plot-area');

  const background = svg.append('g')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', HEIGHT)
    .attr('width', WIDTH)
    .attr('fill', '#ffffff');


  // let tooltip = svgMain.select('.tt-area').append('g')
  //   .style('opacity', 1)
  //   .attr('class', 'tooltip')
  //   .attr('transform', 'translate(0,0)')

  // tooltip.append('text')
  //   .attr('class', 'tt-text');

  // const mousemove = (e, d) => {
  //   let ttt = d3.select('.tt-text');
  //   const [x, y] = d3.pointer(e);
  //   ttt.text(d.key);
    
  //   tooltip.attr('transform', `translate(${x}, ${y})`);
  // }

  // const mouseover = (e) => {
  //   tooltip.style('opacity', 1)
  // }

  // const mouseleave = (e) => {
  //   console.log('left')
  //   tooltip.style('opacity', 0)
  // }

  const groups = svg.append('g').selectAll('g')
    .data(stackData)
    .enter()
    .append('g')
    .attr('class', d => `bars ${diseaseMapping[d.key]}`)
    // .on("mouseover", mouseover)
    // .on("mouseleave", mouseleave)
    // .on("mousemove", mousemove)
    .style('fill', (d) => colorMap(d.key));

  console.log(xScale(0));
    
  const bars = groups.selectAll('rect')
    .data(d => {
      console.log(d);
      return d;
    })
    .enter()
    .append('rect')
    .attr('x', d => { 
      return xScale(d[0])
    })
    .attr('y', d => yScale(d.data.Year))
    .attr('height', yScale.bandwidth())
    .attr('width', d => xScale(d[1]) - xScale(d[0]));

  const title = svg.append('g')
    .append('text')
    .attr('x', 10)
    .attr('y', 25)
    .attr('font-size', 25)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    .text('Infant Deaths per year Around The World')

  const subTitle = svg.append('g')
    .append('text')
    .attr('x', 10)
    .attr('y', 45)
    .attr('font-size', 12)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    .text('Different stacks indicate the share of children killed by that particular disease')

  const xLabel = svg.append('g')
    .append('text')
    .attr('x', WIDTH/2 - PADDING*(5/3))
    .attr('font-size', 12)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    .attr('y', HEIGHT-PADDING + 40)
    .text('Infant Deaths ( Million )');

  const legends = svg.append('g')
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#000')
    .selectAll('g')
    .data(buckets)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(${WIDTH-PADDING}, ${PADDING + 18*i})`);

  legends.append('rect')
    .attr('height', 15)
    .attr('width', 15)
    .attr('fill', d => colorMap(d))
    .on('mouseover', (e, d) => {
      let excludeDiseases = Object.values(diseaseMapping).filter(s => s !== diseaseMapping[d] ).map( s => `.${s}`).join(' , ');
      d3.selectAll(excludeDiseases)
        .style('opacity', 0.3);

    })
    .on('mouseleave', (e, d) => {
      
      let excludeDiseases = Object.values(diseaseMapping).filter(s => s !== diseaseMapping[d] ).map( s => `.${s}`).join(' , ');
      d3.selectAll(excludeDiseases)
        .style('opacity', 1);
    })

  legends.append('text')
    .attr('text-anchor', 'end')
    .attr('y', 10)
    .attr('x', -7)
    .text(d => d);

  const numberFormatter = Intl.NumberFormat('en', { notation: 'compact'});
  const xAxis = svg.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0, ${HEIGHT-PADDING})`)
    .call(d3.axisBottom()
      .scale(xScale)
      .tickSize(0)
      .tickPadding(4)
      .tickFormat(d => numberFormatter.format(parseInt(d)))
    )
    .call(g => g.select('.domain').attr('stroke', 'silver'))

  const yAxis = svg.append('g')
    .attr('class', 'yAxis')
    .attr('transform', `translate(${PADDING}, 0)`)
    .call(d3.axisLeft()
      .scale(yScale)
      .tickSize(0)
      .tickPadding(8)
    )
    .call( g => g.select('.domain').remove())

}

function graph2() {
  
  const HEIGHT = 600;
  const WIDTH = 1300;
  const PADDING = 60;

  const dataParsed = d3.csvParse(inf_mort_life_expt_cont3);
  console.log(dataParsed);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(dataParsed, x => parseFloat(x.inf_mort2019))])
    .range([PADDING, WIDTH-PADDING]);
  
  const radiusScale = d3.scaleLinear()
    .domain([d3.min(dataParsed, x => parseFloat(x.pop2019)) - 5, d3.max(dataParsed, x => parseFloat(x.pop2019))])
    .range([5, 100]);
  
  // console.log(d3.max(dataParsed, x => parseFloat(x.inf_mort2019)));

  const yScale = d3.scaleLinear()
    .domain([d3.min(dataParsed, x => parseFloat(x.life_expt)) - 5, d3.max(dataParsed, x => parseFloat(x.life_expt))])
    .range([HEIGHT - PADDING, PADDING]);

  
  // const colors = ['#0B3954', '#087E8B', '#BFD7EA', '#FF5A5F', '#C81D25', '#333333'];
  const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#780000', '#36453b'];
  const continents = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
  const colorMap = d3.scaleOrdinal()
    .domain(continents)
    .range(colors);
  
  const continentMap = {
      Africa: 'AF',
      Asia: 'AS',
      Europe: 'EU',
      'North America': 'NA',
      Oceania: 'OC',
      'South America': 'SA'
  };

  const svg = d3.select('#svg2')
    .attr('height', HEIGHT)
    // .attr('style', 'border: 1.5px solid silver')
    .attr('width', WIDTH);
  
  
  const title = svg.append('g')
    .append('text')
    .attr('x', 10)
    .attr('y', 25)
    .attr('font-size', 22)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    .text('Coorelation between Life Expectancy and Infant Deaths (per 1,000 live births) for different countries in the year 2019')
  
  const verticalLines = svg.append('g')
    .attr('class', 'verticalLines')
    .attr('transform', `translate(0, ${HEIGHT-PADDING})`)
    .call(
      d3.axisBottom()
        .scale(xScale)
        .ticks(10)
        .tickSize(-(HEIGHT-2*PADDING))
        .tickFormat(() => '')
    )
    .call(g => g.selectAll('.tick line')
      .attr('stroke', 'silver')
      .attr('stroke-dasharray', 2)
    )
    .call( g => g.select('.domain').remove());
  
  const horizontalLines = svg.append('g')
    .attr('class', 'horizontalLines')
    .attr('transform', `translate(${PADDING}, 0)`)
    .call(
      d3.axisLeft()
        .scale(yScale)
        .ticks(10)
        .tickSize(-(WIDTH-2*PADDING))
        .tickFormat(() => '')
    )
    .call(g => g.selectAll('.tick line')
      .attr('stroke', 'silver')
      .attr('stroke-dasharray', 2)
    )
    .call( g => g.select('.domain').remove());
  
  const vertIndicator = svg.append('g')
      .append('line')
      .style('opacity', 0);
  const horIndicator = svg.append('g')
      .append('line')
      .style('opacity', 0);
  
  const toolTip = svg.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  toolTip.append('rect')
      .attr('height', 40)
      .attr('width', 60)
      .attr('rx', 10)
      .attr('fill', 'red')
      .style('opacity', '0')

  toolTip.append('text')
      .attr('class', 'tt-text-lf')
      .attr('font-size', 12)
      .attr('font-family', 'sans-serif')
      .attr('transform',`translate(10, 39)`)

  toolTip.append('text')
      .attr('class', 'tt-text-id')
      .attr('font-size', 12)
      .attr('font-family', 'sans-serif')
      .attr('transform',`translate(10, 26)`)
      
  toolTip.append('text')
      .attr('class', 'tt-text-c')
      .attr('font-size', 12)
      .attr('font-family', 'sans-serif')
      .attr('transform',`translate(10, 13)`)

  const circles = svg.append('g')
    .selectAll('circle')
    .data(dataParsed)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.inf_mort2019))
    .attr('cy', d => yScale(d.life_expt))
    .attr('class', d => continentMap[d.continent])
    // .attr('r', d => Math.sqrt(radiusScale( d.pop2019)*4/Math.PI))
    .attr('r', d => Math.sqrt(radiusScale( d.pop2019)))
    .on('mouseover', (e, d) => {
      
      toolTip.style('opacity', 1)
        .attr('transform', `translate(${xScale(d.inf_mort2019) + 5}, ${yScale(d.life_expt) - 45 })`)
      d3.select('.tt-text-lf').text(`LE: ${d.life_expt}`)
      d3.select('.tt-text-c').text(`${d.country}`)
      d3.select('.tt-text-id').text(`ID: ${d.inf_mort2019}`)

      vertIndicator
        .style('opacity', 0.6)
        .attr('x1', xScale(0))
        .attr('y1', yScale(d.life_expt))
        .attr('x2', xScale(d.inf_mort2019))
        .attr('y2', yScale(d.life_expt))
        .attr('stroke', '#333');

      horIndicator
        .style('opacity', 0.6)
        .attr('x1', xScale(d.inf_mort2019))
        .attr('y1', yScale(d3.min(dataParsed, x => parseFloat(x.life_expt)) - 5))
        .attr('x2', xScale(d.inf_mort2019))
        .attr('y2', yScale(d.life_expt))
        .attr('stroke', '#333');
    })
    .on('mouseleave', (e, d) => {
      vertIndicator.style('opacity', 0);
      horIndicator.style('opacity', 0);
      toolTip.style('opacity', 0);
    })
    .style('fill', d => colorMap(d.continent))
    .style('opacity', 0.7);
  

  const xLabel = svg.append('g')
    .append('text')
    .attr('x', WIDTH/2 - PADDING*(5/3))
    .attr('font-size', 12)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    .attr('y', HEIGHT-PADDING + 40)
    .text('Infant Deaths per 1,000 live births');

  const yLabel = svg.append('g')
    .append('text')
    // .attr('x', PADDING)
    .attr('font-size', 12)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    // .attr('y', HEIGHT/2)
    .attr('text-anchor', 'start')
    .attr('transform', `translate(${PADDING - 35}, ${HEIGHT/2 + 70}) rotate(-90)`)
    .text('Life Expectancy (years)');
    
  const legends = svg.append('g')
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#000')
    .selectAll('g')
    .data(continents)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(${WIDTH-PADDING}, ${PADDING + 18*i})`);

  legends.append('rect')
    .attr('height', 15)
    .attr('width', 15)
    .attr('fill', d => colorMap(d))
    .on('mouseover', (e, d) => {
      // let excludeContinents = Object.values(diseaseMapping).filter(s => s !== diseaseMapping[d] ).map( s => `.${s}`).join(' , ');
      let excludeContinents = continents.filter(s => s !== d).map( s => `.${continentMap[s]}`).join(' , ');
      d3.selectAll(excludeContinents)
        .style('opacity', 0.2);

    })
    .on('mouseleave', (e, d) => {
      
      let excludeContinents = continents.filter(s => s !== d).map( s => `.${continentMap[s]}`).join(' , ');
      d3.selectAll(excludeContinents)
        .style('opacity', 0.7);
    })

  legends.append('text')
    .attr('text-anchor', 'end')
    .attr('y', 10)
    .attr('x', -7)
    .text(d => d);

  // const numberFormatter = Intl.NumberFormat('en', { notation: 'compact'});
  const xAxis = svg.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0, ${HEIGHT-PADDING})`)
    .call(d3.axisBottom()
      .scale(xScale)
    )
    .call(g => g.select('.domain').remove());
  

  const yAxis = svg.append('g')
    .attr('class', 'yAxis')
    .attr('transform', `translate(${PADDING}, 0)`)
    .call(d3.axisLeft()
      .scale(yScale)
    )
    .call(g => g.select('.domain').remove());

    
}

function graph3() {
  
  const HEIGHT = 600;
  const WIDTH = 1300;
  const PADDING = 60;

  const dataParsed = d3.csvParse(inf_mort_hdi_cont4);
  console.log(dataParsed);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(dataParsed, x => parseFloat(x.inf_mort2019))])
    .range([PADDING, WIDTH-PADDING]);
  
  const radiusScale = d3.scaleLinear()
    .domain([d3.min(dataParsed, x => parseFloat(x.pop2019)) - 5, d3.max(dataParsed, x => parseFloat(x.pop2019))])
    .range([5, 100]);
  
  // console.log(d3.max(dataParsed, x => parseFloat(x.inf_mort2019)));

  const yScale = d3.scaleLinear()
    .domain([d3.min(dataParsed, x => parseFloat(x.hdr2019)), d3.max(dataParsed, x => parseFloat(x.hdr2019))])
    .range([HEIGHT - PADDING, PADDING]);

  
  // const colors = ['#FED766', '#058ED9', '#002642', '#EF7A85', '#840032', '#333333'];
  const colors = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#780000', '#36453b'];
  const continents = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
  const colorMap = d3.scaleOrdinal()
    .domain(continents)
    .range(colors);
  
  const continentMap = {
      Africa: 'AF',
      Asia: 'AS',
      Europe: 'EU',
      'North America': 'NA',
      Oceania: 'OC',
      'South America': 'SA'
  };

  const svg = d3.select('#svg3')
    .attr('height', HEIGHT)
    // .attr('style', 'border: 1.5px solid silver')
    .attr('width', WIDTH);
  
  
  const title = svg.append('g')
    .append('text')
    .attr('x', 10)
    .attr('y', 25)
    .attr('font-size', 22)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    .text('Coorelation between Human Development Index and Infant Deaths (per 1,000 live births) for different countries in the year 2019')
  
  const verticalLines = svg.append('g')
    .attr('class', 'verticalLines')
    .attr('transform', `translate(0, ${HEIGHT-PADDING})`)
    .call(
      d3.axisBottom()
        .scale(xScale)
        .ticks(10)
        .tickSize(-(HEIGHT-2*PADDING))
        .tickFormat(() => '')
    )
    .call(g => g.selectAll('.tick line')
      .attr('stroke', 'silver')
      .attr('stroke-dasharray', 2)
    )
    .call( g => g.select('.domain').remove());
  
  const horizontalLines = svg.append('g')
    .attr('class', 'horizontalLines')
    .attr('transform', `translate(${PADDING}, 0)`)
    .call(
      d3.axisLeft()
        .scale(yScale)
        .ticks(10)
        .tickSize(-(WIDTH-2*PADDING))
        .tickFormat(() => '')
    )
    .call(g => g.selectAll('.tick line')
      .attr('stroke', 'silver')
      .attr('stroke-dasharray', 2)
    )
    .call( g => g.select('.domain').remove());
  
  const vertIndicator = svg.append('g')
      .append('line')
      .style('opacity', 0);
  const horIndicator = svg.append('g')
      .append('line')
      .style('opacity', 0);
  
  const toolTip = svg.append('g')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  toolTip.append('rect')
      .attr('height', 40)
      .attr('width', 60)
      .attr('rx', 10)
      .attr('fill', 'red')
      .style('opacity', '0')

  toolTip.append('text')
      .attr('class', 'tt-text-lf')
      .attr('font-size', 12)
      .attr('font-family', 'sans-serif')
      .attr('transform',`translate(10, 39)`)

  toolTip.append('text')
      .attr('class', 'tt-text-id')
      .attr('font-size', 12)
      .attr('font-family', 'sans-serif')
      .attr('transform',`translate(10, 26)`)
      
  toolTip.append('text')
      .attr('class', 'tt-text-c')
      .attr('font-size', 12)
      .attr('font-family', 'sans-serif')
      .attr('transform',`translate(10, 13)`)

  const circles = svg.append('g')
    .selectAll('circle')
    .data(dataParsed)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(d.inf_mort2019))
    .attr('cy', d => yScale(d.hdr2019))
    .attr('class', d => continentMap[d.continent])
    // .attr('r', d => Math.sqrt(radiusScale( d.pop2019)*4/Math.PI))
    .attr('r', d => Math.sqrt(radiusScale( d.pop2019)))
    .on('mouseover', (e, d) => {
      
      toolTip.style('opacity', 1)
        .attr('transform', `translate(${xScale(d.inf_mort2019) + 5}, ${yScale(d.hdr2019) - 45 })`)
      d3.select('.tt-text-lf').text(`HDI: ${d.hdr2019}`)
      d3.select('.tt-text-c').text(`${d.country}`)
      d3.select('.tt-text-id').text(`ID: ${d.inf_mort2019}`)

      vertIndicator
        .style('opacity', 0.6)
        .attr('x1', xScale(0))
        .attr('y1', yScale(d.hdr2019))
        .attr('x2', xScale(d.inf_mort2019))
        .attr('y2', yScale(d.hdr2019))
        .attr('stroke', '#333');

      horIndicator
        .style('opacity', 0.6)
        .attr('x1', xScale(d.inf_mort2019))
        .attr('y1', yScale(d3.min(dataParsed, x => parseFloat(x.hdr2019))))
        .attr('x2', xScale(d.inf_mort2019))
        .attr('y2', yScale(d.hdr2019))
        .attr('stroke', '#333');
    })
    .on('mouseleave', (e, d) => {
      vertIndicator.style('opacity', 0);
      horIndicator.style('opacity', 0);
      toolTip.style('opacity', 0);
    })
    .style('fill', d => colorMap(d.continent))
    .style('opacity', 0.7);
  

  const xLabel = svg.append('g')
    .append('text')
    .attr('x', WIDTH/2 - PADDING*(5/3))
    .attr('font-size', 12)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    .attr('y', HEIGHT-PADDING + 40)
    .text('Infant Deaths per 1,000 live births');

  const yLabel = svg.append('g')
    .append('text')
    // .attr('x', PADDING)
    .attr('font-size', 12)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#505152')
    // .attr('y', HEIGHT/2)
    .attr('text-anchor', 'start')
    .attr('transform', `translate(${PADDING - 35}, ${HEIGHT/2 + 50}) rotate(-90)`)
    .text('HDI score');
    
  const legends = svg.append('g')
    .attr('font-size', 10)
    .attr('font-family', 'sans-serif')
    .attr('fill', '#000')
    .selectAll('g')
    .data(continents)
    .enter()
    .append('g')
    .attr('transform', (d, i) => `translate(${WIDTH-PADDING}, ${PADDING + 18*i})`);

  legends.append('rect')
    .attr('height', 15)
    .attr('width', 15)
    .attr('fill', d => colorMap(d))
    .on('mouseover', (e, d) => {
      // let excludeContinents = Object.values(diseaseMapping).filter(s => s !== diseaseMapping[d] ).map( s => `.${s}`).join(' , ');
      let excludeContinents = continents.filter(s => s !== d).map( s => `.${continentMap[s]}`).join(' , ');
      d3.selectAll(excludeContinents)
        .style('opacity', 0.2);

    })
    .on('mouseleave', (e, d) => {
      
      let excludeContinents = continents.filter(s => s !== d).map( s => `.${continentMap[s]}`).join(' , ');
      d3.selectAll(excludeContinents)
        .style('opacity', 0.7);
    })

  legends.append('text')
    .attr('text-anchor', 'end')
    .attr('y', 10)
    .attr('x', -7)
    .text(d => d);

  // const numberFormatter = Intl.NumberFormat('en', { notation: 'compact'});
  const xAxis = svg.append('g')
    .attr('class', 'xAxis')
    .attr('transform', `translate(0, ${HEIGHT-PADDING})`)
    .call(d3.axisBottom()
      .scale(xScale)
    )
    .call(g => g.select('.domain').remove());
  

  const yAxis = svg.append('g')
    .attr('class', 'yAxis')
    .attr('transform', `translate(${PADDING}, 0)`)
    .call(d3.axisLeft()
      .scale(yScale)
    )
    .call(g => g.select('.domain').remove());

    
}
graph1();
// graph2();
graph3();