// src/CurrencySwap.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const Error = styled.div`
  color: red;
  margin-top: 10px;
`;

const CurrencySwap = () => {
  const [tokens, setTokens] = useState([]);
  const [prices, setPrices] = useState({});
  const [fromCurrency, setFromCurrency] = useState('');
  const [toCurrency, setToCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('https://interview.switcheo.com/prices.json')
      .then(response => {
        const data = response.data;
        setPrices(data);
        setTokens(Object.keys(data));
      })
      .catch(error => console.error('Error fetching token prices:', error));
  }, []);

  const handleSwap = (e) => {
    e.preventDefault();
    if (!fromCurrency || !toCurrency || !amount) {
      setError('Please fill in all fields');
      return;
    }
    if (fromCurrency === toCurrency) {
      setError('From and To currencies cannot be the same');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const fromPrice = prices[fromCurrency]?.price;
    const toPrice = prices[toCurrency]?.price;
    if (!fromPrice || !toPrice) {
      setError('Invalid currency selected');
      return;
    }

    const converted = (amount * fromPrice) / toPrice;
    setConvertedAmount(converted.toFixed(2));
    setError('');
  };

  return (
    <Container>
      <Title>Currency Swap</Title>
      <form onSubmit={handleSwap}>
        <FormGroup>
          <Label htmlFor="from-currency">From:</Label>
          <Select
            id="from-currency"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            <option value="">Select currency</option>
            {tokens.map(token => (
              <option key={token} value={token}>{prices[token]?.currency}</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="to-currency">To:</Label>
          <Select
            id="to-currency"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            <option value="">Select currency</option>
            {tokens.map(token => (
              <option key={token} value={token}>{prices[token]?.currency}</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="amount">Amount:</Label>
          <Input
            id="amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormGroup>
        <Button type="submit">Swap</Button>
      </form>
      {error && <Error>{error}</Error>}
      {convertedAmount && (
        <div>
          <h3>Converted Amount: {convertedAmount} {toCurrency}</h3>
        </div>
      )}
    </Container>
  );
};

export default CurrencySwap;
