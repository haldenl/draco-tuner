import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RootAction } from '../../actions';
import { RootState } from '../../reducers';
import './collection-pane.css';

interface StateProps {
}

interface DispatchProps {
}

interface Props extends StateProps, DispatchProps {}

class CollectionPane extends React.Component<Props, any> {
  render() {
    return (
      <div styleName="collection-pane">
      </div>
    );
  }
}

const mapStateToProps = (state: RootState): StateProps => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch<RootAction>): DispatchProps => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CollectionPane);