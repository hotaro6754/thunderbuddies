(function(){
  function formatCurrency(x){
    return new Intl.NumberFormat('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:2}).format(x);
  }

  function parseNumber(id){
    const el = document.getElementById(id);
    if(!el) return 0;
    const v = parseFloat(el.value);
    return isNaN(v)?0:v;
  }

  function calculate(){
    const amount = parseNumber('sip-amount');
    const annual = parseNumber('sip-return')/100;
    const years = parseNumber('sip-years');
    const freq = parseInt(document.getElementById('sip-frequency').value,10) || 12;

    if(amount <= 0 || annual <= 0 || years <= 0){
      alert('Please enter positive values for amount, return and years');
      return;
    }

    const i = annual / freq; // periodic rate
    const n = years * freq; // total periods

    // Future Value of series: FV = P * [((1+i)^n -1)/i]
    const fv = amount * ((Math.pow(1+i, n) - 1) / i);
    const invested = amount * n;
    const gains = fv - invested;

    // approximate annualized return (CAGR-like) for the series
    // For series, CAGR of invested lumps is not exact; this is an approximation
    let cagr = 0;
    try{
      cagr = Math.pow((fv / invested), 1/years) - 1;
    }catch(e){
      cagr = 0;
    }

    document.getElementById('mv').textContent = formatCurrency(fv);
    document.getElementById('invested').textContent = formatCurrency(invested);
    document.getElementById('gains').textContent = formatCurrency(gains);
    document.getElementById('cagr').textContent = (cagr>0? ( (cagr*100).toFixed(2)+'%') : '-') ;
  }

  function reset(){
    ['sip-amount','sip-return','sip-years'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
    document.getElementById('sip-frequency').value='12';
    ['mv','invested','gains','cagr'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent='-'; });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const calc = document.getElementById('sip-calc');
    if(calc) calc.addEventListener('click', calculate);
    const rst = document.getElementById('sip-reset');
    if(rst) rst.addEventListener('click', reset);
  });
})();
