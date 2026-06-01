const companyDao = require("../dao/companyDao");

class companyService {
  createCompany(companyDto) {
    const { name, industry, website } = companyDto;
    return companyDao.createCompany(name, industry, website);
  }
}

module.exports = new companyService();
