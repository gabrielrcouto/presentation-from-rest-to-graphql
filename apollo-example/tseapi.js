const { RESTDataSource } = require('apollo-datasource-rest');

class TSEAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://divulga.tse.jus.br/2018/divulgacao/oficial/295/dadosdivweb/br';
  }

  async getVotes() {
    const response = JSON.parse(await this.get('br-c0001-e000295-w.js', { ttl: 5 }, {
        timeout: 1000,
      }));
    return response.cand;
  }
}

module.exports = TSEAPI;
