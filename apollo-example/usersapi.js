const { RESTDataSource } = require('apollo-datasource-rest');

class UsersAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.randomuser.me/';
  }

  async getUser() {
    const { results } = await this.get('');
    return results;
  }
}

module.exports = UsersAPI;
