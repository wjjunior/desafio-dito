import React, { Component } from 'react'
import './Timeline.scss';

export default class Timeline extends Component {

  constructor(props) {
    super(props);
    this.state = {
      items: []
    }
  }

  componentDidMount() {
    fetch('https://storage.googleapis.com/dito-questions/events.json', {
      method: "GET",
      headers: {
        "access-control-allow-origin": "*",
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then(res => res.json())
      .then(json => {
        this.setState({
          items: json.events,
        })
      });
  }

  /**
   * Filtra transações no Objeto
   * 
   * @memberof Timeline
   * @param {obj} obj - Objeto contendo transações identificadas pelo event "comprou".
   */
  filterTransactions = (obj) => {
    let newObj = obj.filter(function (el) {
      return el.event === "comprou"
    }).sort(function (a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });

    let transactions = [];
    Object.values(newObj).forEach(el => {
      let transaction = { transaction: el.custom_data.find(o => o.key === "transaction_id").value, revenue: el.revenue, date: el.timestamp, store: el.custom_data.find(o => o.key === "store_name").value };
      transactions.push(transaction);
    });

    return transactions;

  }

  /**
   * Filtra transações no Objeto para a transação solicitada
   * 
   * @memberof Timeline
   * @param {obj} obj - Objeto contendo produtos identificadas pelo event "comprou-produto".
   * @param {string} transaction - Transação para que sejam listados os produtos correspondentes".
   */
  filterProducts = (obj, transaction) => {
    let newObj = obj.filter(function (el) {
      return el.event === "comprou-produto" && el.custom_data.find(o => o.value === transaction)
    });

    let products = [];
    Object.values(newObj).forEach(el => {
      let product = { name: el.custom_data.find(o => o.key === "product_name").value, price: el.custom_data.find(o => o.key === "product_price").value };
      products.push(product);
    });

    return products;
  }

  render() {
    var { items } = this.state;
    return (
      <ul className="timeline">
        {
          this.filterTransactions(items).map((item, i) => {
            return (
              <li className="timeline-left" key={i}>
                <div className="timeline-badge">
                  <img src="assets/check.svg" alt="check" />
                </div>
                <div className="timeline-panel">
                  <div className="timeline-heading">
                    <div><img src="assets/calendar.svg" alt="calendar" /> {new Intl.DateTimeFormat('pt-br').format(new Date(item.date))}</div>
                    <div><img src="assets/clock.svg" alt="clock" /> {new Intl.DateTimeFormat('pt-br', { hour: 'numeric', minute: 'numeric' }).format(new Date(item.date))}</div>
                    <div><img src="assets/place.svg" alt="place" /> {item.store}</div>
                    <div><img src="assets/money.svg" alt="money" /> {new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item.revenue)}</div>
                  </div>
                  <div className="timeline-body">
                    <table className="table-item">
                      <thead>
                        <tr>
                          <th className="product-description">Produto</th>
                          <th>Preço</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          this.filterProducts(items, item.transaction).map((item, i) => {
                            return (
                              <tr key={i}>
                                <td>{item.name}</td>
                                <td>{new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(item.price)}</td>
                              </tr>
                            );
                          })
                        }
                      </tbody>
                    </table>

                  </div>
                </div>
              </li>
            )
          })
        }
      </ul>
    )
  }
}