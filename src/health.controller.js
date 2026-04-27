const { Controller, Get } = require('@nestjs/common');

class HealthController {
  getHealth() {
    return { status: 'ok' };
  }
}

Controller()(HealthController);
Get()(HealthController.prototype, 'getHealth', Object.getOwnPropertyDescriptor(HealthController.prototype, 'getHealth'));

module.exports = { HealthController };
