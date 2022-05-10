import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Button, Box, TextField, MenuItem, styled, InputAdornment, Autocomplete} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import deLocale from 'date-fns/locale/de';
import ClearIcon from '@mui/icons-material/Clear';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import PropTypes from 'prop-types';
import SearchAssetInput from './SearchAssetsInput';

const StyledTextField = styled(TextField)({
  //Label color when focused
  '& label.Mui-focused': {
    color: '#493f35',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#493f35',
  },
  '& .MuiOutlinedInput-root': {
    //Standard border color
    '& fieldset': {
      borderColor: '#c4b8ac',
    },
    //Border color on hover
    '&:hover fieldset': {
      borderColor: '#493f35',
    },
    //Border color when focused
    '&.Mui-focused fieldset': {
      borderColor: '#493f35',
    },
  },
});

const initialValues = {
    assetType: 'share',
    asset: null,
    assetInput: '',
    typeShare: 'buy',
    typeCrypto: 'buy',
    typeCash: 'deposit',
    date: new Date(),
    quantity: '1',
    value: '',
    sum: '',
    sumCash: '',
    tax: '0',
    fee: '0'
}

/**
 * Form for adding an activity
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const AddActivityForm = props => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  let dateError = '';
  let changedByDatePicker = false;

  useEffect(() => {
    validate();
  }, [values]);

  const shares = props.portfolioData['shares'];
  const crypto = props.portfolioData['crypto'];
  const cash = props.portfolioData['cash'];

  /**
   * Function to handle the changes in different input fields
   * @param event
   */
  const handleInputChange = event => {
    const {name, value} = event.target;
    if (name === 'quantity') {
      setValues({
        ...values,
        sum: (value * values.value).toFixed(2),
        [name]: value
      })
    } else if (name === 'value') {
      setValues({
        ...values,
        sum: (value * values.quantity).toFixed(2),
        [name]: value
      })
    } else {
      setValues({
        ...values,
        [name]: value
      })
    }
  }

  const numberRegex = /^(?!0*(\.0+)?$)(\d+|\d*\.\d+)$/
  const numberWithZeroRegex = /^(\d+|\d*\.\d+)$/
    
  /**
   * Encapsulates all the individual field's validations
   * @returns boolean
   */
  const validate = () => {
    let newDateError = changedByDatePicker ? (dateError ? 'Not a valid date' : '') : (errors.date === undefined ? '' : errors.date);
    newDateError = values.date === null ? 'Not a valid date' : newDateError;
    let newErrors = {date: newDateError};
    newErrors.asset = values.asset ? '' : 'This field is required';
    if(values.asset) {
        if (values.assetType === 'share') newErrors = {...newErrors, ...validateShare(newErrors.date)};
        if (values.assetType === 'crypto') newErrors = {...newErrors, ...validateCrypto(newErrors.date)};
        if (values.assetType === 'cash') newErrors = {...newErrors, ...validateCash(newErrors.date)};
        newErrors.fee = (numberWithZeroRegex).test(values.fee) ? '' : 'Not a valid number';
    }
    setErrors({...newErrors});
    const valid = Object.values(newErrors).every(x => x === '');
    setValid(valid);
    return valid;
  }

  Date.prototype.getFormattedString = function() {
    const date = new Date(this.valueOf());
    const year = date.getFullYear();
    let month = `${date.getMonth()+1}`;
    if (month.length === 1) {
      month = `0${month}`;
    }
    let day = `${date.getDate()}`;
    if (day.length === 1) {
      day = `0${day}`;
    }
    return `${year}-${month}-${day}`;
  }

  const getQuantityAtDate = (dailyData, date) => {
    const dateString = date.getFormattedString();
    if (dailyData[dateString] === undefined) {
      const firstDateWithData = (Object.keys(dailyData))[0];
      if (new Date (dateString) > new Date (firstDateWithData)) {
        return dailyData[firstDateWithData].quantity;
      } else {
        return 0;
      }
    } else {
      return dailyData[dateString].quantity;
    }
  }
  
  /**
   * Occurs validation of shares actions
   * @returns {{}}
   */
  const validateShare = (dateError) => {
    let errors = {};
    errors.quantity = '';
    if (values.typeShare === 'sell' || values.typeShare === 'dividend') {
        const share = shares.find(element => element.symbol === values.asset.symbol);
        if (share === undefined) {
            errors.typeShare = 'Sell/Dividend not valid for this share'
        } else {
            if (!(numberRegex).test(values.quantity)) {
                errors.quantity = 'Not a valid number';
            } else if (dateError === '') {
              const shareQuantityAtDate = getQuantityAtDate(share.dailyDataForValueDevelopment, values.date);
              errors.quantity = shareQuantityAtDate >= values.quantity ? '' : "Can't be greater than bought quantity at date";
            }
        }
    } else {
        if (!(numberRegex).test(values.quantity)) {
            errors.quantity = 'Not a valid number';
        }
    }
    errors.value = (numberRegex).test(values.value) ? '' : 'Not a valid number';
    if (!(numberWithZeroRegex).test(values.tax)) {
      errors.tax = 'Not a valid number';
    } else {
      const checkTaxGreaterThanSum = errors.value === '' ? errors.quantity === '' : false;
      errors.tax = checkTaxGreaterThanSum && (values.sum < values.tax) ? "Can't be greater than sum" : '';
    }
    return errors;
  }

  /**
   * Occurs validation of crypto actions
   * @returns {{}}
   */
  const validateCrypto = (dateError) => {
    let errors = {};
    if (values.typeCrypto === 'sell') {
        let coin = crypto.find(element => element.symbol === values.asset.symbol);
        if (coin === undefined) {
            errors.typeCrypto = 'Sell not valid for this coin'
        } else {
            if (!(numberRegex).test(values.quantity)) {
                errors.quantity = 'Not a valid number';
            } else if (dateError === '') {
              const coinQuantityAtDate = getQuantityAtDate(coin.dailyDataForValueDevelopment, values.date);
              errors.quantity = coinQuantityAtDate >= values.quantity ? '' : "Can't be greater than bought quantity at date";
            }
        };
    } else {
        if (!(numberRegex).test(values.quantity)) {
            errors.quantity = 'Not a valid number';
        }
    }
    errors.value = (numberRegex).test(values.value) ? '' : 'Not a valid number';
    if (!(numberWithZeroRegex).test(values.tax)) {
        errors.tax = 'Not a valid number';
    } else {
        const checkTaxGreaterThanSum = errors.value === '' ? errors.quantity === '' : false;
        errors.tax = checkTaxGreaterThanSum && (values.sum < values.tax) ? "Can't be greater than sum" : '';
    }
    return errors;
  }

  const getSumAtDate = (dailyData, date) => {
    const dateString = date.getFormattedString();
    if (dailyData[dateString] === undefined) {
      const firstDateWithData = (Object.keys(dailyData))[0];
      if (new Date (dateString) > new Date (firstDateWithData)) {
        return dailyData[firstDateWithData].value;
      } else {
        return 0;
      }
    } else {
      return dailyData[dateString].value;
    }
  }

  /**
   * Occurs validation of cash actions
   * @returns {{}}
   */
  const validateCash = (dateError) => {
    let errors = {};
    if (values.typeCash !== 'deposit') {
        let account = cash.find(element => element.symbol === values.asset.symbol);
        if (account.value === 0) {
            errors.typeCash = 'Payout not valid for this account'
        } else {
            if (!(numberRegex).test(values.sumCash)) {
                errors.sumCash = 'Not a valid number';
            } else if (dateError === '') {
              const accountValueAtDate = getSumAtDate(account.dailyDataForValueDevelopment, values.date);  
              errors.sumCash = accountValueAtDate >= values.sumCash ? '' : "Can't be greater than deposited amount at date";
            }
        };
    } else {
        errors.sumCash = !(numberRegex).test(values.sumCash) ? 'Not a valid number' : '';
    }
    if (!(numberWithZeroRegex).test(values.tax)) {
        errors.tax = 'Not a valid number';
    } else {
        const checkTaxGreaterThanSum = errors.sumCash === '';
        errors.tax = checkTaxGreaterThanSum && (values.sumCash < values.tax) ? "Can't be greater than sum" : '';
    }
    return errors;
  }

  let navigate = useNavigate();
  const routeChange = path => {
    navigate(path);
  }  

  /**
   * Submits the form once the buttons are enabled
   * @param event
   */
  const handleSubmit = event => {
    event.preventDefault();
    if(validate()) {
        if (values.assetType === 'share') props.addActivity(values.assetType, values.asset, values.typeShare, values.date, values.quantity, values.sum, values.value, values.tax, values.fee);
        if (values.assetType === 'crypto') props.addActivity(values.assetType, values.asset, values.typeCrypto, values.date, values.quantity, values.sum, values.value, values.tax, values.fee);
        if (values.assetType === 'cash') props.addActivity(values.assetType, values.asset, values.typeCash, values.date, '1', values.sumCash, values.sumCash, values.tax, values.fee);
        if (!addAnother) {
            routeChange('../activities');
        } else {
            alert('Activity saved!');
        }
    }
  }

  return (
    <Grid
      container
      component='form'
      autoComplete='off'
      onSubmit={handleSubmit}
      noValidate
      className='flex-column justify-content-center'
    >
      <Grid
        container
        className='flex-row justify-content-center align-items-start'
      >
        <Grid item className='col-4 me-3'>
          <StyledTextField
            fullWidth
            margin='normal'
            select
            label='type of asset'
            name='assetType'
            onChange={handleInputChange}
            value={values.assetType}
          >
            <MenuItem value='share'>Share</MenuItem>
            <MenuItem value='crypto'>Crypto</MenuItem>
            <MenuItem value='cash'>Cash</MenuItem>
          </StyledTextField>
        </Grid>
        <Grid item className='col-7'>
          <SearchAssetInput
            values={values}
            errors={errors}
            portfolioData={props.portfolioData}
            handleInputChange={handleInputChange}
            StyledTextField={StyledTextField}
            setValues={setValues}
          />
        </Grid>
      </Grid>

      <Grid
        container
        className='flex-row justify-content-center align-items-start'
      >
        {values.assetType === 'share' &&
          <Grid item className='col-5 me-5'>
            <StyledTextField
              fullWidth
              select
              margin='normal'
              label='type'
              name='typeShare'
              onChange={handleInputChange}
              value={values.typeShare}
              {...(errors.typeShare && {error: true, helperText: errors.typeShare})}
            >
              <MenuItem value='buy'>Buy</MenuItem>
              <MenuItem value='sell'>Sell</MenuItem>
              <MenuItem value='dividend'>Dividend</MenuItem>
            </StyledTextField>
          </Grid>
        }
        {values.assetType === 'crypto' &&
          <Grid item className='col-5 me-5'>
            <StyledTextField
              fullWidth
              select
              margin='normal'
              label='type'
              name='typeCrypto'
              onChange={handleInputChange}
              value={values.typeCrypto}
              {...(errors.typeCrypto && {error: true, helperText: errors.typeCrypto})}
            >
              <MenuItem value='buy'>Buy</MenuItem>
              <MenuItem value='sell'>Sell</MenuItem>
            </StyledTextField>
          </Grid>
        }
        {values.assetType === 'cash' &&
          <Grid item className='col-5 me-5'>
            <StyledTextField
              fullWidth
              select
              margin='normal'
              label='type'
              name='typeCash'
              onChange={handleInputChange}
              value={values.typeCash}
              {...(errors.typeCash && {error: true, helperText: errors.typeCash})}
            >
              <MenuItem value='deposit'>Deposit</MenuItem>
              <MenuItem value='payout'>Payout</MenuItem>
            </StyledTextField>
          </Grid>
        }
        <Grid item className='col-5'>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={deLocale}>
            <DatePicker
              disableFuture
              label='Date'
              name='date'
              id='add-activity-date'
              mask='__.__.____'
              views={['day']}
              value={values.date}
              onError={(reason, value) => {
                dateError = reason;
                changedByDatePicker = true;
                validate();
              }}
              onChange={(newValue, newInputValue) => {
                setValues({
                  ...values,
                  date: newValue
                });
              }}
              renderInput={(params) => <TextField {...params} margin='normal' fullWidth {...(errors.date && {
                error: true,
                helperText: errors.date
              })}/>}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      {(values.assetType === 'share' || values.assetType === 'crypto') &&
        <Grid
          container
          className='flex-row justify-content-center align-items-start'
        >
          <Grid item className='d-flex flex-row justify-content-center col-12'>
            <Box className='d-flex col-5'>
              <StyledTextField
                fullWidth
                margin='normal'
                label='Value per item'
                name='value'
                id='add-activity-value'
                onChange={handleInputChange}
                value={values.value}
                {...(errors.value && {error: true, helperText: errors.value})}
                InputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  endAdornment: <InputAdornment position='end'>€</InputAdornment>
                }}
              />
            </Box>
            <ClearIcon style={{fontSize: 'medium', margin: '1rem', marginTop: '2rem', color: '#493f35'}}/>
            <Box className='col-3'>
              <StyledTextField
                margin='normal'
                label='Quantity'
                name='quantity'
                id='add-activity-quantity'
                onChange={handleInputChange}
                value={values.quantity}
                {...(errors.quantity && {error: true, helperText: errors.quantity})}
                InputProps={{inputMode: 'numeric', pattern: '[0-9]*'}}
              />
            </Box>
          </Grid>
          <Grid item className='d-flex flex-column justify-content-center align-items-center col-5'>
            <DragHandleIcon className='mt-3 mb-1' style={{fontSize: 'medium', color: '#493f35'}}/>
            <StyledTextField
              fullWidth
              margin='normal'
              disabled
              label='Sum'
              name='sum'
              id='add-activity-sum'
              onChange={handleInputChange}
              value={values.sum}
              InputProps={{
                required: true,
                inputMode: 'numeric',
                pattern: '[0-9]*',
                endAdornment: <InputAdornment position='end'>€</InputAdornment>
              }}
            />
          </Grid>
        </Grid>
      }
      {values.assetType === 'cash' &&
        <Grid
          container
          className='flex-row justify-content-center align-items-start'
        >
          <Box className='col-5'>
            <StyledTextField
              fullWidth
              margin='normal'
              label='Sum'
              name='sumCash'
              id='add-activity-sum-cash'
              onChange={handleInputChange}
              value={values.sumCash}
              {...(errors.sumCash && {error: true, helperText: errors.sumCash})}
              InputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
                endAdornment: <InputAdornment position='end'>€</InputAdornment>
              }}
            />
          </Box>
        </Grid>
      }
      <Grid
        container
        className='flex-row justify-content-center align-items-start col-12'
      >
        <Box className='col-5 me-3'>
          <StyledTextField
            fullWidth
            margin='normal'
            label='Fees'
            name='fee'
            id='add-activity-fee'
            onChange={handleInputChange}
            value={values.fee}
            {...(errors.fee && {error: true, helperText: errors.fee})}
            InputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              endAdornment: <InputAdornment position='end'>€</InputAdornment>
            }}
          />
        </Box>
        <Box className='col-5'>
          <StyledTextField
            fullWidth
            margin='normal'
            label='Taxes'
            name='tax'
            id='add-activity-tax'
            onChange={handleInputChange}
            value={values.tax}
            {...(errors.tax && {error: true, helperText: errors.tax})}
            InputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              endAdornment: <InputAdornment position='end'>€</InputAdornment>
            }}
          />
        </Box>
      </Grid>

      <Grid
        container
        className='flex-column justify-content-center align-items-center'
      >
        <Button
          className='my-3'
          variant='outlined'
          disabled={!valid}
          type='submit'
          onClick={() => setAddAnother(false)}
          sx={{
            color: 'black',
            borderColor: 'rgb(78 185 111)',
            backgroundColor: 'rgb(78 185 111)',
            '&:hover': {
              backgroundColor: 'rgb(78 185 111)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgb(228 231 235)',
            }
          }}
        >
          Save
        </Button>
        <Button
          variant='outlined'
          disabled={!valid}
          type='submit'
          onClick={() => setAddAnother(true)}
          sx={{
            color: 'black',
            borderColor: 'rgb(59 151 210)',
            backgroundColor: 'rgb(59 151 210)',
            '&:hover': {
              backgroundColor: 'rgb(59 151 210)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgb(228 231 235)',
            }
          }}
        >
          Save and add another
        </Button>
      </Grid>
    </Grid>
  );
}

AddActivityForm.propTypes = {
  addActivity: PropTypes.func,
  portfolioData: PropTypes.object
};

export default AddActivityForm;

