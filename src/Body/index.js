import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import Component from 'react-class'
import { Item } from 'react-flex'
import getDataRangeToRender from './getDataRangeToRender'
import assign from 'object-assign'
import join from 'src/utils/join'

import EmptyText from './EmptyText'

import Scroller from './Scroller'
import ColumnGroup from './ColumnGroup'

const ColumnGroupFactory = React.createFactory(ColumnGroup)

export default class Body extends Component {

  constructor(props){
    super(props)

    this.state = {
      bodyHeight: 0,
      scrollTop: 0
    }
  }
  
  componentDidMount(){
    const bodyNode = findDOMNode(this.refs.body)
    const bodyHeight = bodyNode.offsetHeight


    this.setState({
      bodyHeight
    })
  }

  render(){
    const props = this.props
    const {data, columns} = props
    const {loading} = props
    const className = join(
        'react-datagrid__body'
      )

    return <Item 
      {...props} 
      flex 
      column 
      className={className}
      data={null}
      ref="body"
    >
      {!loading && this.renderScroller()}
    </Item>
  }

  renderScroller(){
    const props = this.props
    const {data, rowHeight} = props

    if (!data) {
      console.error(
          `Something went wrong with dataSource, most likely loading prop is set to false, and promise did not resolve` 
        )
      return
    }
    
    const contentHeight = rowHeight * data.length

    return <Scroller 
      contentHeight={contentHeight}
      onScroll={this.onScroll}
    >
      {this.renderColumnGroups()}
    </Scroller>
  }

  renderColumnGroups(){
    const props = this.props
    const {
      data,
      columns,
      rowHeight,
    } = props

    const bodyHeight = this.state.bodyHeight
    const totalHeight = totalHeight || window.outerHeight 
    const scrollTop = this.state.scrollTop
    const {from, to} = getDataRangeToRender(totalHeight, rowHeight, scrollTop)
    const offsetTop = from * rowHeight

    const columnGroupProps = {
      data,
      offsetTop,
      scrollTop,
      rowHeight,
      from,
      to,
      viewportHeight: bodyHeight,
      globalProps: props
    }

    /**
     * If no coumnGroup is specified, create a ColumGroup with all passed columns
     */
    if (!props.children) {
      return <ColumnGroup 
        {...columnGroupProps} 
        columns={columns} 
        width={'100%'}
      />  
    } else {
    /**
     * Children are specified, take each Columngroup and insert props
     */
      return React.Children.map(props.children, (child, index) => {
         return React.cloneElement(
            child, 
            assign(
              {}, 
              child.props, 
              columnGroupProps,
              {key: index}
            )
          )
      })
    }
  }

  onScroll(scrollTop, event){
    this.setState({
      scrollTop
    })
  }
}

Body.defaultProps = {
  rowHeight: 40
}

Body.propTypes = {
  loading: PropTypes.bool,
}