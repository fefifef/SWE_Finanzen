import React, {useState, useEffect} from 'react';
import { Grid, Button, TextField, MenuItem, styled, InputAdornment, Typography} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import deLocale from 'date-fns/locale/de';
import ClearIcon from '@mui/icons-material/Clear';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import PropTypes from 'prop-types';

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
    assettype: "share",
    asset: "",
    typeShare: "buy",
    typeCrypto: "buy",
    typeCash: "deposit",
    date: new Date(),
    quantity: 1,
    value: '',
    sum: '',
    tax: 0,
    fee: 0
}

/**
 * Form for adding an activity
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const AddActivityForm = (props) => {
    
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        validate();
    }, [values]);

    const shares = props.portfolioData["shares"];
    const crypto = props.portfolioData["crypto"];
    const cash = props.portfolioData["cash"];

    const handleInputChange = e => {
        const { name, value } = e.target;
        if (name==="quantity") {
            setValues({
                ...values,
                sum: (value*values.value),
                [name]:value
            })
        } else if (name==="value") {
            setValues({
                ...values,
                sum: (value*values.quantity),
                [name]:value
            })
        } else {
            setValues({
                ...values,
                [name]:value
            })
        }
    }

    const numberRegex = /^(?!0*(\.0+)?$)(\d+|\d*\.\d+)$/
    const numberWithZeroRegex = /^(\d+|\d*\.\d+)$/

    const validate = () => {
        let errors = {};
        errors.asset = values.asset ? "" : "This field is required";
        if(values.asset) {
            if (values.assettype === "share") errors = {...errors, ...validateShare()};
            if (values.assettype === "crypto") errors = {...errors, ...validateCrypto()};
            if (values.assettype === "cash") errors = {...errors, ...validateCash()};
            errors.tax = (numberWithZeroRegex).test(values.tax) ? "" : "Not a valid number";
            errors.fee = (numberWithZeroRegex).test(values.fee) ? "" : "Not a valid number";
        }
        
        setErrors({...errors});

        return Object.values(errors).every(x => x === "");
    }

    const validateShare = () => {
        let errors = {};
        if (values.typeShare === "sell" || values.typeShare === "dividend") {
            let share = shares.find(element => element.symbol === values.asset);
            if (typeof(share) === 'undefined') {
                errors.typeShare = "Sell/Dividend not valid for this share"
            } else {
                if (!(numberRegex).test(values.quantity)) {
                    errors.quantity = "Not a valid number";
                } else {
                    errors.quantity = share.quantity >= values.quantity ? "" : "Can't be greater than quantity in your portfolio"
                }
            };
        }
        errors.value = (numberRegex).test(values.value) ? "" : "Not a valid number";
        errors.sum = (numberRegex).test(values.sum) ? "" : "Not a valid number";
        return errors;
    }

    const validateCrypto = () => {
        let errors = {};
        if (values.typeCrypto === "sell") {
            let coin = crypto.find(element => element.symbol === values.asset);
            if (typeof(coin) === 'undefined') {
                errors.typeCrypto = "Sell not valid for this coin"
            } else {
                if (!(numberRegex).test(values.quantity)) {
                    errors.quantity = "Not a valid number";
                } else {
                    errors.quantity = coin.quantity >= values.quantity ? "" : "Can't be greater than quantity in your portfolio"
                }
            };
        }
        errors.value = (numberRegex).test(values.value) ? "" : "Not a valid number";
        errors.sum = (numberRegex).test(values.sum) ? "" : "Not a valid number";
        return errors;
    }

    const validateCash = () => {
        let errors = {};
        if (values.typeCash === "payout") {
            let account = cash.find(element => element.symbol === values.asset);
            if (typeof(account) === 'undefined') {
                errors.typeCash = "Payout not valid for this account"
            } else {
                if (!(numberRegex).test(values.sum)) {
                    errors.sum = "Not a valid number";
                } else {
                    errors.sum = account.value >= values.sum ? "" : "Can't be greater than deposited amout"
                }
            };
        }
        return errors;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if(validate()) {
            if (values.assettype === "share") props.addActivity(values.assettype, values.asset, values.typeShare, values.date, values.quantity, values.sum, values.tax, values.fee);
            if (values.assettype === "crypto") props.addActivity(values.assettype, values.asset, values.typeCrypto, values.date, values.quantity, values.sum, values.tax, values.fee);
            if (values.assettype === "cash") props.addActivity(values.assettype, values.asset, values.typeCash, values.date, 1, values.sum, values.tax, values.fee);
        }
    }

  return (
    <Grid 
        container 
        direction="column"
        justifyContent="space-evenly"
        alignItems="stretch"
        component="form" 
        autoComplete="off"
        onSubmit={handleSubmit}
        noValidate
    >
        <Grid item xs={4} sx={{ margin: '1rem'}}>
            <StyledTextField
                margin="normal"
                select
                label="assettype"
                name="assettype"
                onChange = {handleInputChange}
                value={values.assettype}
            >
                <MenuItem value={"share"}>Share</MenuItem>
                <MenuItem value={"crypto"}>Crypto</MenuItem>
                <MenuItem value={"cash"}>Cash</MenuItem>
            </StyledTextField>
            <StyledTextField
                margin="normal"
                type="search"
                label="asset/account"
                name="asset"
                onChange = {handleInputChange}
                value={values.asset}
                {...(errors.asset && {error: true, helperText: errors.asset})}
            >

            </StyledTextField>

        </Grid>
        <Grid item xs={4} sx={{ margin: '1rem'}}>
                {values.assettype === "share" &&
                    <StyledTextField
                    select
                    label="type"
                    name="typeShare"
                    onChange = {handleInputChange}
                    value={values.typeShare}
                    {...(errors.typeShare && {error: true, helperText: errors.typeShare})}
                    >
                        <MenuItem value={"buy"}>Buy</MenuItem>
                        <MenuItem value={"sell"}>Sell</MenuItem>
                        <MenuItem value={"dividend"}>Dividend</MenuItem>
                    </StyledTextField>
                }
                {values.assettype === "crypto" &&
                    <StyledTextField
                    select
                    label="type"
                    name="typeCrypto"
                    onChange = {handleInputChange}
                    value={values.typeCrypto}
                    {...(errors.typeCrypto && {error: true, helperText: errors.typeCrypto})}
                    >
                        <MenuItem value={"buy"}>Buy</MenuItem>
                        <MenuItem value={"sell"}>Sell</MenuItem>
                    </StyledTextField>
                }
                {values.assettype === "cash" &&
                    <StyledTextField
                    select
                    label="type"
                    name="typeCash"
                    onChange = {handleInputChange}
                    value={values.typeCash}
                    {...(errors.typeCash && {error: true, helperText: errors.typeCash})}
                    >
                        <MenuItem value={"deposit"}>Deposit</MenuItem>
                        <MenuItem value={"payout"}>Payout</MenuItem>
                        <MenuItem value={"interest"}>Interest</MenuItem>
                    </StyledTextField>
                }
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={deLocale}>    
                    <DatePicker
                        disableFuture
                        label="Date"
                        name="date"
                        mask = '__.__.____'
                        views={['day']}
                        value={values.date}
                        onChange={(newValue) => {
                            setValues({
                                ...values,
                                ['date']:newValue
                            });}}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
        </Grid>
        <Grid item xs={4} sx={{ margin: '1rem'}}>
            {(values.assettype === "share" || values.assettype === "crypto") &&
                <Grid container 
                    direction="row"
                    justifyContent="center"
                    alignItems="space-around"
                >
                    <StyledTextField
                        margin="normal"
                        label="Value per Item"
                        name="value"
                        id="add-activity-value"
                        onChange = {handleInputChange}
                        value={values.value}
                        {...(errors.value && {error: true, helperText: errors.value})}
                        InputProps={{ inputMode: 'numeric', pattern: '[0-9]*', endAdornment: <InputAdornment position="end">€</InputAdornment>}} 
                    ></StyledTextField>
                    <ClearIcon style={{fontSize: 'medium', margin: '1rem', color: '#493f35'}}></ClearIcon>
                    <StyledTextField
                        margin="normal"
                        label="Quantity"
                        name="quantity"
                        id="add-activity-quantity"
                        onChange = {handleInputChange}
                        value={values.quantity}
                        {...(errors.quantity && {error: true, helperText: errors.quantity})}
                        InputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}} 
                    ></StyledTextField>
                    <DragHandleIcon style={{fontSize: 'medium', margin: '1rem', color: '#493f35'}}></DragHandleIcon>
                    <StyledTextField
                        margin="normal"
                        disabled
                        label="Sum"
                        name="sum"
                        id="add-activity-sum"
                        onChange = {handleInputChange}
                        value={values.sum}
                        InputProps={{ required: true, inputMode: 'numeric', pattern: '[0-9]*', endAdornment: <InputAdornment position="end">€</InputAdornment>}} 
                    ></StyledTextField>
                </Grid>
            }
            {values.assettype === "cash" &&
                <Grid container 
                    direction="row"
                    justifyContent="center"
                    alignItems="space-around"
                >
                    <StyledTextField
                        margin="normal"
                        label="Sum"
                        name="sum"
                        id="add-activity-sum-cash"
                        onChange = {handleInputChange}
                        value={values.sum}
                        {...(errors.sum && {error: true, helperText: errors.sum})}
                        InputProps={{ inputMode: 'numeric', pattern: '[0-9]*', endAdornment: <InputAdornment position="end">€</InputAdornment>}} 
                    ></StyledTextField>
                </Grid>
            }
        </Grid>
        <Grid item xs={4} sx={{ margin: '1rem'}}>
            <Grid container 
                direction="row"
                justifyContent="center"
                alignItems="space-around"
            >        
                <StyledTextField
                    margin="normal"
                    label="Fees"
                    name="fee"
                    id="add-activity-fee"
                    onChange = {handleInputChange}
                    value={values.fee}
                    {...(errors.fee && {error: true, helperText: errors.fee})}
                    InputProps={{ inputMode: 'numeric', pattern: '[0-9]*', endAdornment: <InputAdornment position="end">€</InputAdornment>}} 
                ></StyledTextField>
                <StyledTextField
                    margin="normal"
                    label="Taxes"
                    name="tax"
                    id="add-activity-tax"
                    onChange = {handleInputChange}
                    value={values.tax}
                    {...(errors.tax && {error: true, helperText: errors.tax})}
                    InputProps={{ inputMode: 'numeric', pattern: '[0-9]*', endAdornment: <InputAdornment position="end">€</InputAdornment>}} 
                ></StyledTextField>
            </Grid>
        </Grid>
        <Button type="submit">ADD</Button>
    </Grid>
  );
}

AddActivityForm.propTypes = {
    addActivity: PropTypes.func,
    portfolioData: PropTypes.object
};

export default AddActivityForm;

