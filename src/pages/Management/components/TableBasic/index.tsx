import React, { useState } from 'react';
import { Table, Input, InputNumber, Form, Button, Modal, message } from 'antd';
import { ItemState, EditableProps } from './Type';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: ItemState;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable1 = (props: { columName: string; data: ItemState[]; editHandle: (item: ItemState) => void }) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: ItemState) => record.key === editingKey;

  const edit = (record: ItemState) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as ItemState;

      const newData = [...props.data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        props.editHandle({ ...item, ...row });
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      editable: false,
    },
    {
      title: props.columName,
      dataIndex: 'name',
      width: '25%',
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: ItemState) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              保存
            </a>
            <a onClick={cancel}>取消</a>
          </span>
        ) : (
          <a onClick={() => edit(record)}>编辑</a>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: ItemState) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={props.data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EditableTable extends React.Component<EditableProps, any> {
  state: {
    data: ItemState[];
    visible: boolean;
    newCategoreName: string;
  } = {
    data: [],
    visible: false,
    newCategoreName: '',
  };

  componentDidMount() {
    this.fetchCategoresHandle();
  }

  fetchCategoresHandle() {
    this.props.handleFetchAll().then((res: { data: Array<{ id: number; name: string }> }) => {
      const data = res.data.map((item) => {
        return { key: `${item.id}`, id: item.id, name: item.name };
      });
      this.setState({ data });
    });
  }

  editorHandle(item: ItemState) {
    const { id, name } = item;
    this.props.handleEdit({id, name}).then(() => {
      this.fetchCategoresHandle();
    });
  }

  // 添加分类
  handleAddCategoryOk() {
    const name = this.state.newCategoreName;
    this.props.handleCreate({name}).then(() =>{
      this.fetchCategoresHandle();
      message.success('添加成功');
    });
    this.setState({
      visible: false,
      newCategoreName: '',
    });
  }

  // 取消分类
  handleAddCategoryCancel() {
    this.setState({
      visible: false,
    });
  }

  handleShowModal() {
    this.setState({
      newCategoreName: '',
      visible: true,
    });
  }

  render() {
    return (
      <>
        <Button type="primary" onClick={() => this.handleShowModal()}>
          {this.props.title}
        </Button>
        <EditableTable1
          data={this.state.data}
          editHandle={(item: ItemState) => this.editorHandle(item)}
          columName={this.props.columName}
        />
        <Modal
          title={this.props.title}
          visible={this.state.visible}
          onOk={() => this.handleAddCategoryOk()}
          onCancel={() => this.handleAddCategoryCancel()}
          cancelText="取消"
          okText="确定"
        >
          <Input
            placeholder={`请输入${this.props.title}`}
            onChange={(value) => this.setState({ newCategoreName: value.target.value })}
          />
        </Modal>
      </>
    );
  }
}

export default EditableTable;
