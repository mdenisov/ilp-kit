import React, {Component, PropTypes} from 'react'
import {reduxForm} from 'redux-form'
import registerValidation from './RegisterValidation'

import Alert from 'react-bootstrap/lib/Alert'

import Input from 'components/Input/Input'

import { loadCode } from 'redux/actions/invite'

import classNames from 'classnames/bind'
import styles from './RegisterForm.scss'
const cx = classNames.bind(styles)

// TODO async validation on username
@reduxForm({
  form: 'register',
  fields: ['username', 'email', 'password', 'inviteCode',
    'name', 'phone', 'address1', 'address2', 'city',
    'region', 'country', 'zip_code'],
  validate: registerValidation
}, state => ({
  invite: state.invite.invite,
  config: state.auth.config
}), {loadCode})
export default class RegisterForm extends Component {
  static propTypes = {
    invite: PropTypes.object,
    loadCode: PropTypes.func,
    params: PropTypes.object,
    config: PropTypes.object,

    // Form
    fields: PropTypes.object.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    register: PropTypes.func.isRequired,
    fail: PropTypes.object
  }

  state = {}

  componentDidMount() {
    // this.refs.fakeuser.style = {display: 'none'}
    setTimeout(() => {
      this.setState({hideFakes: true})
    }, 1)

    this.handleUrlInviteCode()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.params !== nextProps.params) {
      this.handleUrlInviteCode(nextProps)
    }
  }

  handleUrlInviteCode = (props = this.props) => {
    const inviteCode = props.params.inviteCode

    if (!inviteCode) return

    this.props.fields.inviteCode.onChange(inviteCode)
    this.handleAddInviteCode(inviteCode)
  }

  handleAddInviteCodeClick = (e) => {
    e.preventDefault()

    this.setState({
      ...this.state,
      showInviteInput: true
    })
  }

  // TODO:UX Invite code async validation
  handleAddInviteCode = (input) => {
    const inviteCode = input.value !== undefined ? input.value : input

    // redux-form onChange needs to happen first
    // TODO try without a timeout
    setTimeout(() => {
      if (!this.props.fields.inviteCode.valid || !inviteCode) return

      this.props.loadCode(inviteCode)
        .then(code => {
          if (!code) return

          this.setState({
            ...this.state,
            showInviteInput: false
          })
        })
    }, 50)
  }

  render() {
    const { invite, handleSubmit, register, fail,
      fields: { username, email, password, inviteCode, name, phone,
        address1, address2, city, region, country, zip_code },
      pristine, invalid, submitting, config } = this.props
    const hideFakes = this.state && this.state.hideFakes
    const { showInviteInput } = this.state

    return (
      <form onSubmit={handleSubmit(register)} autoComplete="off">
        {fail && fail.id &&
        <Alert bsStyle="danger">
          {fail.id === 'UsernameTakenError' &&
          <div>Username is already taken</div>}
          {fail.id === 'EmailTakenError' &&
          <div>Email is already taken</div>}
          {fail.id === 'InvalidBodyError' &&
          <div>Registration is disabled without an invite code</div>}
          {fail.id === 'ServerError' &&
          <div>Something went wrong</div>}
        </Alert>}

        <div>
          {/* Hey chrome, can you please stop autofilling the register form? */}
          {!hideFakes &&
            <div className={cx('fakeInputs')}>
              <input type="text" name="fakeusernameremembered" ref="fakeuser"/>
              <input type="password" name="fakepasswordremembered" ref="fakepass" />
            </div>}

          <Input object={username} label="Username" size="lg" focus autoCapitalize="off" />
          <Input object={email} label="Email" size="lg" autoCapitalize="off" />
          <Input object={password} label="Password" size="lg" type="password" />

          {config.antiFraud &&
          <div>
            <div className="row">
              <div className="col-sm-6">
                <Input object={name} label="Full Name" size="lg" />
              </div>
              <div className="col-sm-6">
                <Input object={phone} label="Phone" size="lg" />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <Input object={address1} label="Address 1" size="lg" />
              </div>
              <div className="col-sm-6">
                <Input object={address2} label="Address 2" size="lg" />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <Input object={city} label="City" size="lg" />
              </div>
              <div className="col-sm-6">
                <Input object={region} label="Region" size="lg" />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <Input object={country} label="Country" size="lg" />
              </div>
              <div className="col-sm-6">
                <Input object={zip_code} label="Zip Code" size="lg" />
              </div>
            </div>
          </div>}

          {/* Invite code: Step 1 */}
          {!showInviteInput && !invite.code &&
          <a href="" className={cx('inviteLink')} onClick={this.handleAddInviteCodeClick}>Have an invite code?</a>}

          {/* Invite code: Step 2 */}
          {showInviteInput &&
          <Input object={inviteCode} label="Invite Code" size="lg" focus
                 onChange={this.handleAddInviteCode} />}

          {/* Invite code: Step 3 */}
          {invite.code && !invite.claimed && !showInviteInput &&
          <div className={cx('inviteCode', 'row')}>
            <span className={cx('text', 'col-sm-7')}>Invite code has been added!</span>
            {/* TODO:REFACTOR shouldn't use the global config */}
            <span className={cx('balance', 'col-sm-5')}>
              <span className={cx('label')}>Balance </span>
              <span className={cx('number')}>
                {config.currencySymbol}{invite.amount}
              </span>
            </span>
          </div>}

          {/* Invite code has already been claimed */}
          {invite.claimed &&
          <div className={cx('claimed')}>
            Provided invite code has already been used. <a href="" onClick={this.handleAddInviteCodeClick}>Try another one</a>
          </div>}
        </div>
        <button type="submit" className="btn btn-complete" disabled={pristine || invalid || submitting}>
          {submitting ? ' Registering...' : ' Register'}
        </button>
      </form>
    )
  }
}
