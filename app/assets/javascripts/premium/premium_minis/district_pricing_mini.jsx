EC.DistrictPricingMini = React.createClass({

  render: function(){
    return(
  <div className='pricing-mini'>
    <header className='pricing-mini-header purple'>
      <h4>School & District Premium</h4>
    </header>
    <section className='pricing-info'>
      <div className='premium-rates'>
      <h4>Discounts available</h4>
      <h4>for multiple schools</h4>
      </div>
      <ul className='text-left'>
        <li>Everything in Teacher Premium</li>
        <li>Professional development sessions</li>
        <li>Batch rostering students</li>
        <li>Administrator dashboard for school-<br/>
          wide and district wide information
        </li>
      </ul>
    </section>
    <button type='button' className='btn btn-default mini-btn purple'>Sign Up</button>
  </div>
);
  }
});
