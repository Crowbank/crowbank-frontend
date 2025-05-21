const pageMock = jest.fn();
pageMock.base = jest.fn();
pageMock.redirect = jest.fn();
pageMock.start = jest.fn();
pageMock.exit = jest.fn();

// Add this to capture route definitions
pageMock.routes = {};
pageMock.mockImplementation((path, ...handlers) => {
  pageMock.routes[path] = handlers;
});

module.exports = pageMock;
