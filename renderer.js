const App = () => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement("h1", null, "Hello World"), 
    React.createElement(App, null)
  );
};

const button = document.querySelector('.runaway');
button.addEventListener('click', () => {
  const target = document.querySelector('.app');
  ReactDOM.render(React.createElement(App, null), target);
});