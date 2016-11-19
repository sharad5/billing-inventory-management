var OrderLine = React.createClass({
  getInitialState:function () {
    return{
      quantity: 1,
      unit_price: this.props.price,
      price: this.props.price
    }
  },
  handleQuantityChange: function (e) {
    var newQuantity = parseInt(e.target.value);
    var oldQuantity = this.state.quantity,
        oldPrice=this.state.price;
    if(newQuantity && newQuantity<= this.props.stock){
      var newPrice=this.state.unit_price*newQuantity;
      this.setState({price:newPrice, quantity:newQuantity},function () {
        this.props.quantityUpdate(this.props.pk, newQuantity-oldQuantity, newPrice-oldPrice);
      }.bind(this));
    }
    else{
      var newPrice=this.state.unit_price*1;
      this.setState({price:this.state.unit_price, quantity:1});
      this.props.quantityUpdate(this.props.pk, 1-oldQuantity, newPrice-oldPrice);
      e.target.value = 1;
    }
  },
  render: function () {
    return(
      <tr>
        <td><p>{this.props.title}</p><br/> UPC- <em> {this.props.upc}</em></td>
        <td>{this.state.unit_price}</td>
        <td><input type="text" className="form-control" defaultValue="1" onChange={this.handleQuantityChange}/></td>
        <td>{this.state.price}</td>
      </tr>
    )
  }
});

var OrderTable = React.createClass({
  getInitialState:function () {
    return {
      lines:[],
      discount:0,
      subtotal:0,
      total_quantity:0,
      total_price: 0,
      discountPercent:0,
      billing_details:"",
      order_id:null,
      date:new Date().toString()
    }
  },
  handleBillingDetailsChange:function (e) {
    this.setState({billing_details:e.target.value});
  },
  handleQuantityChange: function (pk,quantity, price) {
    var lines = this.state.lines, update=React.addons.update;
    var lineIndex = lines.findIndex(function (c) {
      return c.id == pk;
    });
    console.log(lineIndex);
    var updatedLine = update(lines[lineIndex],{quantity:{$set:lines[lineIndex].quantity+quantity}, total_price:{$set: lines[lineIndex].total_price+price} });
    var newLines = update(lines,{
      $splice: [[lineIndex, 1, updatedLine]]
    });
    this.setState({total_quantity:this.state.total_quantity+quantity, subtotal:this.state.subtotal+price, total_price:this.state.total_price+price, lines:newLines},function () {
      this.setState({discountPercent:(this.state.discount)/this.state.subtotal})
    }.bind(this))
  },
  componentDidMount: function () {
    $('#add_product').on("select2:select", function (evt) {
      var id=$(evt.target).val();
      $.getJSON('/products/product-details/'+id, function (data) {
        data=data[0];
        var newState= React.addons.update(this.state,{
          lines: {
            $push: [{id:data.pk,title:data.fields.title, quantity:1, upc: data.fields.upc, price:data.fields.selling_price, total_price:data.fields.selling_price, stock:data.fields.stock}]
          },
        });
        this.setState(newState);
        this.setState({subtotal:this.state.subtotal+data.fields.selling_price, total_quantity:this.state.total_quantity+1, total_price:this.state.total_price+data.fields.selling_price},function () {
          this.setState({discountPercent:this.state.discount/this.state.subtotal})
          $('#add_product').val(null).trigger("change");
        });
      }.bind(this));

    }.bind(this));
    var formatProduct = function (product) {
      if(!product.id){
        return product.text;
      }
      var $product = $('<div class="row"><div class="col-md-12 col-xs-12">'+product.text+'('+product.upc+') - Rs. '+product.price+'</div></div>');
      return $product;
    }
    var formatProductSelection = function (product) {
      if(product.upc)
        return product.text+' ('+product.upc+')';
      else {
        return product.text;
      }
    }
    $('#add_product').select2({
      placeholder: "Search for product",
      allowClear: true,
      width:'100%',
      ajax: {
          dataType: "json",
          type: "GET",
          delay: 500,
          url: function (term) {
            return '/products/upc-search/'+term.term;
          },
          processResults: function (data) {
            var newdata= [];
            for(var i=0; i < data.length;i++){
              newdata.push({id:data[i].pk, text:data[i].fields.title, upc:data[i].fields.upc, price:data[i].fields.selling_price, stock:data[i].fields.stock});
            }
            return {results: newdata}
          },
      },
      minimumInputLength: 1,
      templateResult: formatProduct,
      templateSelection: formatProductSelection,
    });

  },
  handleDicountChange: function (e) {
    if(!e.target.value || e.target.value > this.state.subtotal){
      this.setState({total_price:this.state.subtotal, discount:0});
      e.target.value=0;
    }
    else{
      this.setState({total_price:this.state.subtotal-e.target.value, discount:e.target.value,discountPercent:(e.target.value)/this.state.subtotal});
    }
  },
  handleSaveOrder: function () {
    var button = $("#submit-button");
    button.addClass("disabled");
    button.html("<i class=\"fa fa-spinner fa-spin fa-2x fa-fw\"></i> Saving...");
    var invoicebutton = $("#print-button");
    var order_details = {
      billing_details: this.state.billing_details,
      lines:this.state.lines,
      discount:this.state.discount,
      subtotal:this.state.subtotal,
      total_quantity:this.state.total_quantity,
      total_price: this.state.total_price,
    }
    $.ajax({
      method: "POST",
      url: "/orders/save-order/",
      data: {"data":JSON.stringify(order_details)},
      success: function (result) {
        button.html("<i class=\"fa fa-check \"></i> SAVED!");
        invoicebutton.removeClass("disabled").addClass("active");
        this.setState({order_id:result.id});
      }.bind(this),
      error: function (ajaxContext) {
        button.removeClass("btn-info").addClass("btn-danger");
      }
    });
  },
  render:function () {

    var rows=this.state.lines.map(function (line) {
      return (
          <OrderLine key={line.id} pk={line.id} quantityUpdate={this.handleQuantityChange} title={line.title} upc={line.upc} price={line.price} stock={line.stock}/>
      )
    }.bind(this));
    var summary;
    if(this.state.lines.length>0){
      summary =
      <div>
      <table className="table table-condensed">
        <tbody>
          <tr>
              <td className="highrow"></td>
              <td className="highrow"></td>
              <td className="highrow text-center"><strong>Subtotal</strong></td>
              <td className="highrow text-right">Rs. {this.state.subtotal}</td>
          </tr>
          <tr>
              <td className="emptyrow"></td>
              <td className="emptyrow"></td>
              <td className="emptyrow text-center"><strong>Discount ({(this.state.discountPercent*100).toFixed(2)} %)</strong></td>
              <td className="emptyrow text-right">Rs. <input id="discount-input" type="text" className="form-control" defaultValue="0" onChange={this.handleDicountChange}/></td>
          </tr>
          <tr>
              <td className="emptyrow"><small>This is a computer generated bill</small></td>
              <td className="emptyrow"></td>
              <td className="emptyrow text-center"><strong>Total</strong></td>
              <td className="emptyrow text-right">Rs. {this.state.total_price}</td>
          </tr>
        </tbody>
      </table>
      <div className="row button-row">
        <div className="col-md-6"></div>
        <div className="col-md-3">
          <button id="submit-button" type="button" className="btn btn-success btn-custom" onClick={this.handleSaveOrder}>Submit</button>
        </div>
        <div className="col-md-3">
          <a id="print-button" type="button" href={"/orders/invoice/".concat(this.state.order_id)} target="_blank" className="btn btn-info btn-custom disabled">Print Invoice</a>
        </div>
      </div>

      </div>

    }
    return (
      <div>
      <div className="row">
          <div className="col-xs-12">
              <div className="text-center">
                  <i className="fa fa-search-plus pull-left icon"></i>
                  <h2>New Sale</h2>
              </div>
              <hr/>
              <div className="row">
                  <div className="col-xs-12 col-md-6 col-lg-6 pull-left">
                      <div className="panel panel-default height">
                          <div className="panel-heading">Billing Details</div>
                          <div className="panel-body">
                              <textarea className="form-control" rows="5" id="comment" onChange={this.handleBillingDetailsChange}></textarea>
                          </div>
                      </div>
                  </div>
                  <div className="col-xs-12 col-md-6 col-lg-6">
                      <div className="panel panel-default height">
                          <div className="panel-heading">Other Information</div>
                          <div className="panel-body">
                              <strong>Invoice Date:</strong> {this.state.date}<br/>
                              <strong>Purcahsed On:</strong> {this.state.date}<br/>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div className="row">
          <div className="col-md-12">
              <div className="panel panel-default">
                  <div className="panel-heading">
                      <h3 className="text-center"><strong>Items</strong></h3>
                  </div>
                  <div className="panel-body">
                      <select className="js-example-basic-single js-states form-control" id="add_product">
                      </select>
                      <div className="table-responsive">
                        <table id="items" className="table table-condensed">
                          <thead>
                              <tr>
                                  <td><strong>Item Name</strong></td>
                                  <td><strong>Item Price</strong></td>
                                  <td><strong>Item Quantity</strong></td>
                                  <td><strong>Total</strong></td>
                              </tr>
                          </thead>
                          <tbody>
                            {rows}
                          </tbody>
                        </table>
                        {summary}


                      </div>

                  </div>
              </div>
              <a id="print-button" type="button" href="/orders/new-sale/" className="btn btn-info btn-custom">New Bill</a>
          </div>

      </div>


      </div>
      )
  }
});

ReactDOM.render(
  <OrderTable/>,
  document.getElementById('orderContainer')
);
