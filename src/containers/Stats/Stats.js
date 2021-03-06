import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import moment from 'moment'

import { loadStats } from 'redux/actions/stats'

import classNames from 'classnames/bind'
import styles from './Stats.scss'
const cx = classNames.bind(styles)

@connect(
  state => ({
    user: state.auth.user,
    stats: state.stats.list
  }),
  {loadStats})
export default class Home extends Component {
  static propTypes = {
    user: PropTypes.object,
    loadStats: PropTypes.func,
    stats: PropTypes.array
  }

  componentDidMount() {
    this.props.loadStats()
  }

  renderStat = (stat) => {
    return (
      <div className={cx('stat')}>
        <span className={cx('sourceName')}>{stat.source_name}</span>
        <span className={cx('destinationName')}>{stat.destination_name}</span>
        <span className={cx('sourceAmount')}>{stat.source_amount}</span>
        <span className={cx('destinationAmount')}>{stat.destination_amount}</span>
        <span className={cx('transfersCount')}>{stat.transfers_count}</span>
        <span className={cx('recentDate')}>{moment(stat.recent_date).format('L')}</span>
      </div>
    )
  }

  render() {
    const { stats } = this.props

    return (
      <div>
        <div className={cx('stat', 'header')}>
          <span className={cx('sourceName')}>Sender</span>
          <span className={cx('destinationName')}>Recipient</span>
          <span className={cx('sourceAmount')}>Sender Amount</span>
          <span className={cx('destinationAmount')}>Recipient Amount</span>
          <span className={cx('transfersCount')}>Total Payments</span>
          <span className={cx('recentDate')}>Recent Payment</span>
        </div>
        {stats.map((stat) => {
          return this.renderStat(stat)
        })}
      </div>
    )
  }
}
